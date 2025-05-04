/// <reference types="wesl-plugin/suffixes" />
import { link, LinkedWesl, requestWeslDevice } from "wesl";
import appWesl from "../shaders/app.wesl?link";

main();

async function main(): Promise<void> {
  const linked = await link(appWesl);
  displayShaderCode(linked.dest);

  launchShader(linked);
}

function displayShaderCode(wgslSrc: string): void {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `<pre>${
    wgslSrc + "\n<foo>"
  }<pre>`;
}

async function launchShader(linked: LinkedWesl): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter();
  const device = await requestWeslDevice(adapter);
  const module = linked.createShaderModule(device, {});

  const pipeline = device.createComputePipeline({
    layout: "auto",
    compute: { module },
  });

  const commands = device.createCommandEncoder();
  const pass = commands.beginComputePass();
  pass.setPipeline(pipeline);
  pass.dispatchWorkgroups(1, 1, 1);
  pass.end();
  device.queue.submit([commands.finish()]);
}
