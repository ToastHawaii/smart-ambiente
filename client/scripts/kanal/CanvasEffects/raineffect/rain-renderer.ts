// Copyright (C) 2020 Markus Peloso
// 
// This file is part of smart-ambiente.
// 
// smart-ambiente is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// smart-ambiente is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with smart-ambiente.  If not, see <http://www.gnu.org/licenses/>.

import GL from "./gl-obj";
import createCanvas from "./create-canvas";

let vertShader =
  "precision mediump float;\n#define GLSLIFY 1\n\nattribute vec2 a_position;\n\nvoid main() {\n   gl_Position = vec4(a_position,0.0,1.0);\n}\n";
let fragShader =
  'precision mediump float;\n#define GLSLIFY 1\n\n// textures\nuniform sampler2D u_waterMap;\nuniform sampler2D u_textureShine;\nuniform sampler2D u_texture;\n\n// the texCoords passed in from the vertex shader.\nvarying vec2 v_texCoord;\nuniform vec2 u_resolution;\nuniform float u_textureRatio;\nuniform bool u_renderShine;\nuniform bool u_renderShadow;\nuniform float u_minRefraction;\nuniform float u_refractionDelta;\nuniform float u_brightness;\nuniform float u_alphaMultiply;\nuniform float u_alphaSubtract;\n\n// alpha-blends two colors\nvec4 blend(vec4 bg,vec4 fg){\n  vec3 bgm=bg.rgb*bg.a;\n  vec3 fgm=fg.rgb*fg.a;\n  float ia=1.0-fg.a;\n  float a=(fg.a + bg.a * ia);\n  vec3 rgb;\n  if(a!=0.0){\n    rgb=(fgm + bgm * ia) / a;\n  }else{\n    rgb=vec3(0.0,0.0,0.0);\n  }\n  return vec4(rgb,a);\n}\n\nvec2 pixel(){\n  return vec2(1.0,1.0)/u_resolution;\n}\n\nvec2 texCoord(){\n  return vec2(gl_FragCoord.x, u_resolution.y-gl_FragCoord.y)/u_resolution;\n}\n\n// scales the bg up and proportionally to fill the container\nvec2 scaledTexCoord(){\n  float ratio=u_resolution.x/u_resolution.y;\n  vec2 scale=vec2(1.0,1.0);\n  vec2 offset=vec2(0.0,0.0);\n  float ratioDelta=ratio-u_textureRatio;\n  if(ratioDelta>=0.0){\n    scale.y=(1.0+ratioDelta);\n    offset.y=ratioDelta/2.0;\n  }else{\n    scale.x=(1.0-ratioDelta);\n    offset.x=-ratioDelta/2.0;\n  }\n  return (texCoord()+offset)/scale;\n}\n\n// get color from fg\nvec4 fgColor(float x, float y){\n  vec2 scale=vec2(\n    (u_resolution.x)/u_resolution.x,\n    (u_resolution.y)/u_resolution.y\n  );\n\n  vec2 scaledTexCoord=texCoord()/scale;\n  vec2 offset=vec2(\n    (1.0-(1.0/scale.x))/2.0,\n    (1.0-(1.0/scale.y))/2.0\n  );\n\n  return texture2D(u_waterMap,\n    (scaledTexCoord+offset)+(pixel()*vec2(x,y))\n  );\n}\n\nvoid main() {\n  vec4 bg=texture2D(u_texture,scaledTexCoord());\n\n  vec4 cur = fgColor(0.0,0.0);\n\n  float d=cur.b; // "thickness"\n  float x=cur.g;\n  float y=cur.r;\n\n  float a=clamp(cur.a*u_alphaMultiply-u_alphaSubtract, 0.0,1.0);\n\n  vec2 refraction = (vec2(x,y)-0.5)*2.0;\n  vec2 refractionPos = scaledTexCoord()\n    + (pixel()*refraction*(u_minRefraction+(d*u_refractionDelta)));\n\n  vec4 tex=texture2D(u_texture,refractionPos);\n\n  if(u_renderShine){\n    float maxShine=490.0;\n    float minShine=maxShine*0.18;\n    vec2 shinePos=vec2(0.5,0.5) + ((1.0/512.0)*refraction)* -(minShine+((maxShine-minShine)*d));\n    vec4 shine=texture2D(u_textureShine,shinePos);\n    tex=blend(tex,shine);\n  }\n\n  vec4 fg=vec4(tex.rgb*u_brightness,a);\n\n  if(u_renderShadow){\n    float borderAlpha = fgColor(0.,0.-(d*6.0)).a;\n    borderAlpha=borderAlpha*u_alphaMultiply-(u_alphaSubtract+0.5);\n    borderAlpha=clamp(borderAlpha,0.,1.);\n    borderAlpha*=0.2;\n    vec4 border=vec4(0.,0.,0.,borderAlpha);\n    fg=blend(border,fg);\n  }\n\n  gl_FragColor = blend(bg,fg);\n}\n';

interface Options {
  renderShadow: boolean;
  minRefraction: number;
  maxRefraction: number;
  brightness: number;
  alphaMultiply: number;
  alphaSubtract: number;
}

const defaultOptions: Options = {
  renderShadow: false,
  minRefraction: 256,
  maxRefraction: 512,
  brightness: 1,
  alphaMultiply: 20,
  alphaSubtract: 5
};
export default class RainRenderer {
  constructor(
    canvas: HTMLCanvasElement,
    canvasLiquid: HTMLCanvasElement,
    image: HTMLImageElement | HTMLCanvasElement,
    imageShine: HTMLImageElement | HTMLCanvasElement | undefined = undefined,
    options: Partial<Options> = {}
  ) {
    this.canvas = canvas;
    this.canvasLiquid = canvasLiquid;
    this.imageShine = imageShine;
    this.image = image;
    this.options = Object.assign({}, defaultOptions, options);
    this.init();
  }

  private canvas: HTMLCanvasElement;
  private gl: GL;
  private canvasLiquid: HTMLCanvasElement;
  private width: number;
  private height: number;
  private imageShine: HTMLImageElement | HTMLCanvasElement | undefined;
  private image: HTMLImageElement | HTMLCanvasElement;
  private textures: {
    name: string;
    img: HTMLImageElement | HTMLCanvasElement;
  }[];
  private programWater: WebGLProgram;
  private options: Options;

  private init() {
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.gl = new GL(this.canvas, { alpha: false }, vertShader, fragShader);
    let gl = this.gl;
    this.programWater = gl.program;

    gl.createUniform("2f", "resolution", this.width, this.height);
    gl.createUniform(
      "1f",
      "textureRatio",
      this.image.width / this.image.height
    );
    gl.createUniform(
      "1i",
      "renderShine",
      this.imageShine === undefined ? false : true
    );
    gl.createUniform("1i", "renderShadow", this.options.renderShadow);
    gl.createUniform("1f", "minRefraction", this.options.minRefraction);
    gl.createUniform(
      "1f",
      "refractionDelta",
      this.options.maxRefraction - this.options.minRefraction
    );
    gl.createUniform("1f", "brightness", this.options.brightness);
    gl.createUniform("1f", "alphaMultiply", this.options.alphaMultiply);
    gl.createUniform("1f", "alphaSubtract", this.options.alphaSubtract);

    gl.createTexture(undefined, 0);

    this.textures = [
      {
        name: "textureShine",
        img:
          this.imageShine === undefined ? createCanvas(2, 2) : this.imageShine
      },
      { name: "texture", img: this.image }
    ];

    this.textures.forEach((texture, i) => {
      gl.createTexture(texture.img, i + 1);
      gl.createUniform("1i", texture.name, i + 1);
    });
  }
  public draw() {
    this.gl.useProgram(this.programWater);
    this.updateTexture();
    this.gl.draw();
  }
  public updateTextures() {
    this.textures.forEach((texture, i) => {
      this.gl.activeTexture(i + 1);
      this.gl.updateTexture(texture.img);
    });
  }
  private updateTexture() {
    this.gl.activeTexture(0);
    this.gl.updateTexture(this.canvasLiquid);
  }
}
