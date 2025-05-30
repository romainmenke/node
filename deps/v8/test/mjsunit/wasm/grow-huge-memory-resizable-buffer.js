// Copyright 2025 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Save some memory on Linux; other platforms ignore this flag.
// Flags: --multi-mapped-mock-allocator --experimental-wasm-rab-integration

// Test that we can grow memories to sizes beyond 2GB.

d8.file.execute("test/mjsunit/wasm/wasm-module-builder.js");

function GetMemoryPages(memory) {
  return memory.buffer.byteLength >>> 16;
}

(function TestGrowFromJSMemory() {
  let mem = new WebAssembly.Memory({initial: 200, maximum: 50000});
  mem.toResizableBuffer();
  mem.grow(40000);
  assertEquals(40200, GetMemoryPages(mem));
})();

(function TestGrowFromJSSAB() {
  let mem = new WebAssembly.Memory({initial: 200, maximum: 50000});
  let buf = mem.toResizableBuffer();
  buf.resize(buf.byteLength + 40000 * kPageSize);
  assertEquals(40200, GetMemoryPages(mem));
})();

(function TestGrowFromWasm() {
  let builder = new WasmModuleBuilder();
  builder.addMemory(200, 50000);
  builder.exportMemoryAs("memory");
  builder.addFunction("grow", kSig_i_v)
    .addBody([
      ...wasmI32Const(40000),        // Number of pages to grow by.
      kExprMemoryGrow, kMemoryZero,  // Grow memory.
      kExprDrop,                     // Drop result of grow (old pages).
      kExprMemorySize, kMemoryZero   // Get the memory size.
      ]).exportFunc();
  let instance = builder.instantiate();
  instance.exports.memory.toResizableBuffer();

  assertEquals(40200, instance.exports.grow());
  assertEquals(40200, GetMemoryPages(instance.exports.memory));
})();
