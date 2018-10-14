import * as WebGL from "./webgl";

function GL(this: any, canvas: any, options: any, vert: any, frag: any) {
    this.init(canvas, options, vert, frag);
}
GL.prototype = {
    canvas: undefined,
    gl: undefined,
    program: undefined,
    width: 0,
    height: 0,
    init(canvas: any, options: any, vert: any, frag: any) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.gl = WebGL.getContext(canvas, options);
        this.program = this.createProgram(vert, frag);
        this.useProgram(this.program);
    },
    createProgram(vert: any, frag: any) {
        let program = WebGL.createProgram(this.gl, vert, frag);
        return program;
    },
    useProgram(program: any) {
        this.program = program;
        this.gl.useProgram(program);
    },
    createTexture(source: any, i: any) {
        return WebGL.createTexture(this.gl, source, i);
    },
    createUniform(type: any, name: any, ...v: any[]) {
        WebGL.createUniform(this.gl, this.program, type, name, ...v);
    },
    activeTexture(i: any) {
        WebGL.activeTexture(this.gl, i);
    },
    updateTexture(source: any) {
        WebGL.updateTexture(this.gl, source);
    },
    draw() {
        WebGL.setRectangle(this.gl, -1, -1, 2, 2);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
};

export default GL;