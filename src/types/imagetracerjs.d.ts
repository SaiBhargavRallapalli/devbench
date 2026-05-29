declare module "imagetracerjs" {
  interface ImageTracer {
    imagedataToSVG(imgd: ImageData, options?: Record<string, unknown> | string): string;
  }

  const ImageTracer: ImageTracer;
  export default ImageTracer;
}
