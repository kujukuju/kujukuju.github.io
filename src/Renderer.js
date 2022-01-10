class Renderer {
    static application;

    static backContainer = new PIXI.Container();

    static parallax = new PIXI.Container();
    static container = new PIXI.Container();
    static fixed = new PIXI.Container();

    static background = new PIXI.Container();
    static backgroundish = new PIXI.Container();
    static midcanvas = new DebugCanvas();
    static midground = new PIXI.Container();
    static names = new PIXI.Container();
    static foreground = new PIXI.Container();

    static canvas = new DebugCanvas();

    static fpsTracker = new FPSTracker(0xffffff);
    static cpuTracker = new CPUTracker(0xffffff);

    static glEnabled = false;

    static initialize() {
        Renderer.application = new PIXI.Application({width: window.innerWidth, height: window.innerHeight, autoStart: false});

        Renderer.application.stage.addChild(Renderer.parallax);
        Renderer.application.stage.addChild(Renderer.container);
        Renderer.application.stage.addChild(Renderer.fixed);

        Renderer.container.addChild(Renderer.background);
        Renderer.container.addChild(Renderer.backgroundish);
        Renderer.container.addChild(Renderer.midcanvas);
        Renderer.container.addChild(Renderer.midground);
        Renderer.container.addChild(Renderer.names);
        Renderer.container.addChild(Renderer.foreground);
        Renderer.container.addChild(Renderer.canvas);

        Renderer.parallax.scale.x = 3;
        Renderer.parallax.scale.y = 3;

        Camera.addContainer(Renderer.container);
        Camera.setScaleImmediate(new Vec2(1.5, 1.5));

        const canvas = Renderer.application.view;
        document.getElementById('canvas-container').appendChild(canvas);
        try {
            Renderer.glEnabled = !!(canvas.getContext('webgl') || canvas.getContext('webgl2') || canvas.getContext('experimental-webgl'));
        } catch (e) {}

        window.addEventListener('resize', () => {
            Renderer.resize();
        });
    }

    static render(time) {
        Renderer.fpsTracker.tick(time);
        Renderer.application.render();
    }

    static resize() {
        Renderer.application.renderer.resize(window.innerWidth, window.innerHeight);
    }
}