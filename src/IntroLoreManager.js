class IntroLoreManager {
    static STATE_NOTHING = 0;
    static STATE_PAGE_1 = 1;
    static STATE_PAGE_2 = 2;
    static STATE_PAGE_3 = 3;
    static STATE_PAGE_4 = 4;
    static STATE_DONE = 5;

    static lastState = IntroLoreManager.STATE_NOTHING;
    static state = window.location.protocol.startsWith('file') ? IntroLoreManager.STATE_PAGE_1 : IntroLoreManager.STATE_DONE;

    static initialize() {
        document.getElementById('next1').addEventListener('click', () => {
            IntroLoreManager.state = IntroLoreManager.STATE_PAGE_2;
        });

        document.getElementById('previous2').addEventListener('click', () => {
            IntroLoreManager.state = IntroLoreManager.STATE_PAGE_1;
        });
        document.getElementById('next2').addEventListener('click', () => {
            IntroLoreManager.state = IntroLoreManager.STATE_PAGE_3;
        });

        document.getElementById('previous3').addEventListener('click', () => {
            IntroLoreManager.state = IntroLoreManager.STATE_PAGE_2;
        });
        document.getElementById('next3').addEventListener('click', () => {
            IntroLoreManager.state = IntroLoreManager.STATE_PAGE_4;
        });

        document.getElementById('previous4').addEventListener('click', () => {
            IntroLoreManager.state = IntroLoreManager.STATE_PAGE_3;
        });
        document.getElementById('next4').addEventListener('click', () => {
            IntroLoreManager.state = IntroLoreManager.STATE_DONE;
        });
    }

    static update() {
        if (IntroLoreManager.state !== IntroLoreManager.lastState) {
            IntroLoreManager.lastState = IntroLoreManager.state;

            // update appropriately
            switch (IntroLoreManager.state) {
                case IntroLoreManager.STATE_PAGE_1: {
                    document.getElementById('lore-screen-1').classList.add('visible');
                    document.getElementById('lore-screen-1').classList.remove('hidden');
                    document.getElementById('lore-screen-2').classList.remove('visible');
                    document.getElementById('lore-screen-2').classList.remove('hidden');
                    document.getElementById('lore-screen-3').classList.remove('visible');
                    document.getElementById('lore-screen-3').classList.remove('hidden');
                    document.getElementById('lore-screen-4').classList.remove('visible');
                    document.getElementById('lore-screen-4').classList.remove('hidden');
                } break;

                case IntroLoreManager.STATE_PAGE_2: {
                    document.getElementById('lore-screen-1').classList.remove('visible');
                    document.getElementById('lore-screen-1').classList.add('hidden');
                    document.getElementById('lore-screen-2').classList.add('visible');
                    document.getElementById('lore-screen-2').classList.remove('hidden');
                    document.getElementById('lore-screen-3').classList.remove('visible');
                    document.getElementById('lore-screen-3').classList.remove('hidden');
                    document.getElementById('lore-screen-4').classList.remove('visible');
                    document.getElementById('lore-screen-4').classList.remove('hidden');
                } break;
                
                case IntroLoreManager.STATE_PAGE_3: {
                    document.getElementById('lore-screen-1').classList.remove('visible');
                    document.getElementById('lore-screen-1').classList.add('hidden');
                    document.getElementById('lore-screen-2').classList.remove('visible');
                    document.getElementById('lore-screen-2').classList.add('hidden');
                    document.getElementById('lore-screen-3').classList.add('visible');
                    document.getElementById('lore-screen-3').classList.remove('hidden');
                    document.getElementById('lore-screen-4').classList.remove('visible');
                    document.getElementById('lore-screen-4').classList.remove('hidden');
                } break;
                
                case IntroLoreManager.STATE_PAGE_4: {
                    document.getElementById('lore-screen-1').classList.remove('visible');
                    document.getElementById('lore-screen-1').classList.add('hidden');
                    document.getElementById('lore-screen-2').classList.remove('visible');
                    document.getElementById('lore-screen-2').classList.add('hidden');
                    document.getElementById('lore-screen-3').classList.remove('visible');
                    document.getElementById('lore-screen-3').classList.add('hidden');
                    document.getElementById('lore-screen-4').classList.add('visible');
                    document.getElementById('lore-screen-4').classList.remove('hidden');
                } break;
                
                case IntroLoreManager.STATE_DONE: {
                    document.getElementById('lore-screen-1').style.display = 'none';
                    document.getElementById('lore-screen-2').style.display = 'none';
                    document.getElementById('lore-screen-3').style.display = 'none';
                    document.getElementById('lore-screen-4').style.display = 'none';
                    document.getElementById('lore-screen-background').style.display = 'none';

                    Camera.scaleSpeedStrength = 0.01;
                    Camera.setScale(new Vec2(3, 3));
                } break;
            }
        }
    }
}