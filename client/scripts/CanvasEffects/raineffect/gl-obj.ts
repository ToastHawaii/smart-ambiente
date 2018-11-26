import * as WebGL from "./webgl";

export default class GL {
  public canvas: HTMLCanvasElement;
  public gl:  WebGLRenderingContext;
  public program: WebGLProgram;
  public width: number;
  public height: number;

  constructor(canvas: HTMLCanvasElement, options: WebGLContextAttributes, vert: string, frag: string) {
    this.init(canvas, options, vert, frag);
  }

  public init(canvas: HTMLCanvasElement, options: WebGLContextAttributes, vert: string, frag: string) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.gl = WebGL.getContext(canvas, options);
    this.program = this.createProgram(vert, frag);
    this.useProgram(this.program);
  }
  public createProgram(vert: string, frag: string) {
    let program = WebGL.createProgram(this.gl, vert, frag);
    return program;
  }
  public useProgram(program: WebGLProgram) {
    this.program = program;
    this.gl.useProgram(program);
  }
  public createTexture(source: any, i: number) {
    return WebGL.createTexture(this.gl, source, i);
  }
  public createUniform(type: string, name: string, ...v: any[]) {
    WebGL.createUniform(this.gl, this.program, type, name, ...v);
  }
  public activeTexture(i: number) {
    WebGL.activeTexture(this.gl, i);
  }
  public updateTexture(source: TexImageSource) {
    WebGL.updateTexture(this.gl, source);
  }
  public draw() {
    WebGL.setRectangle(this.gl, -1, -1, 2, 2);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }
}


