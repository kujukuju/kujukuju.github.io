class WhiteFilter extends PIXI.Filter {
    static FRAG_SRC = `
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;

        void main(void) {
            vec4 color = texture2D(uSampler, vTextureCoord);
            gl_FragColor = vec4((color.r * 0.25 + color.a * 0.75), (color.b * 0.25 + color.a * 0.75), (color.g * 0.25 + color.a * 0.75), color.a);
        }
    `;

    constructor() {
        super(null, WhiteFilter.FRAG_SRC);
    }
}

const WHITE_FILTER = new WhiteFilter();