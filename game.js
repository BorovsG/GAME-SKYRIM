// Envolve todo o código numa IIFE para criar um escopo isolado
(function() {

    // ====================================================================
    // CENA: CutsceneScene
    // ====================================================================
    class CutsceneScene extends Phaser.Scene {
        constructor() {
            super({ key: 'CutsceneScene' });
            this.player; 
            this.parallaxLayers = []; 
            this.cutsceneDuration = 5000; // Duração da cutscene em ms
            this.dragon; // Referência ao sprite do dragão
            this.endDemoText; // Texto "FIM DA DEMO"
            this.cutsceneGround; // Chão da cutscene
            this.thanksForPlayingText; // Texto final
            this.skyrimLogo; // Adiciona referência ao logo do Skyrim
        }
    
        preload() {
            // Carrega spritesheets do Dovahkiin
            this.load.spritesheet('dovahkiin_idle', 'assets/Idle.png', { frameWidth: 162, frameHeight: 162 });
            this.load.spritesheet('dovahkiin_run', 'assets/Run.png', { frameWidth: 162, frameHeight: 162 });
    
            // Carrega frames do dragão
            this.load.image('dragon_frame_0', 'assets/dragon/0.png');
            this.load.image('dragon_frame_1', 'assets/dragon/1.png');
            this.load.image('dragon_frame_2', 'assets/dragon/2.png');
    
            // Carrega camadas de fundo parallax
            this.load.image('parallax_layer_0', 'assets/background/sky.png');         
            this.load.image('parallax_layer_1', 'assets/background/sky_cloud.png');  
            this.load.image('parallax_layer_2', 'assets/background/cloud.png');      
            this.load.image('parallax_layer_3', 'assets/background/mountain2.png');  
            this.load.image('parallax_layer_4', 'assets/background/pine1.png');      
            this.load.image('parallax_layer_5', 'assets/background/pine2.png');      
    
            // Carrega a imagem do logo do Skyrim
            this.load.image('skyrim_logo', 'assets/Skyrim-logo.png');
        }
    
        create() {
            const CUTSCENE_WORLD_WIDTH = config.width; 
    
            // Configura zoom inicial da câmera
            this.cameras.main.setZoom(2); 
            this.cameras.main.centerOn(0,0); 
    
            // Adiciona camadas parallax
            const parallaxConfig = [
                { key: 'parallax_layer_0', factor: 0.05, yOffsetFromBottom: 0, isFullHeight: true },
                { key: 'parallax_layer_1', factor: 0.1, yOffsetFromBottom: 220, isFullHeight: false },
                { key: 'parallax_layer_2', factor: 0.15, yOffsetFromBottom: 330, isFullHeight: false },
                { key: 'parallax_layer_3', factor: 0.2, yOffsetFromBottom: 150, isFullHeight: false },
                { key: 'parallax_layer_4', factor: 0.25, yOffsetFromBottom: 60, isFullHeight: false },
                { key: 'parallax_layer_5', factor: 0.3, yOffsetFromBottom: 0, isFullHeight: false }
            ];
    
            parallaxConfig.forEach(layerConfig => {
                const texture = this.textures.get(layerConfig.key);
                if (!texture) return;
                const imageHeight = texture.source[0].height;
                let layer;
                if (layerConfig.isFullHeight) {
                    layer = this.add.tileSprite(0, 0, CUTSCENE_WORLD_WIDTH, config.height, layerConfig.key).setOrigin(0, 0);
                } else {
                    layer = this.add.tileSprite(0, config.height - imageHeight - layerConfig.yOffsetFromBottom, CUTSCENE_WORLD_WIDTH, imageHeight, layerConfig.key).setOrigin(0, 0);
                }
                layer.setScrollFactor(0);
                this.parallaxLayers.push({ obj: layer, factor: layerConfig.factor });
            });
    
            // Adiciona o chão da cutscene
            this.cutsceneGround = this.physics.add.staticGroup().add(this.add.rectangle(
                (config.width * 2) / 2, 
                config.height - 32, 
                config.width * 2, 
                64,
                0x333333
            ));
    
            // Posição do player
            const playerStartX = 100;
            const playerGroundY = config.height - 101.2; 
    
            // Cria o player
            this.player = this.physics.add.sprite(playerStartX, playerGroundY, 'dovahkiin_idle'); 
            this.player.setFlipX(false); 
            this.player.setScale(0.8);
            this.player.setGravityY(600); 
            this.player.body.setSize(60, 57); 
            this.player.body.setOffset(51, 45); 
            this.physics.add.collider(this.player, this.cutsceneGround); 
    
            // Câmera segue o player
            this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    
            // Cria animações do Dovahkiin
            this.anims.create({ key: 'idle_cutscene', frames: this.anims.generateFrameNumbers('dovahkiin_idle', { start: 0, end: 9 }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: 'run_cutscene', frames: this.anims.generateFrameNumbers('dovahkiin_run', { start: 0, end: 7 }), frameRate: 15, repeat: -1 });
    
            this.player.anims.play('idle_cutscene', true); 
    
            // Cria animação do dragão
            this.anims.create({
                key: 'dragon_anim',
                frames: [
                    { key: 'dragon_frame_0' },
                    { key: 'dragon_frame_1' },
                    { key: 'dragon_frame_2' }
                ],
                frameRate: 5, 
                repeat: -1 
            });
    
            // Adiciona o dragão com escala e posição ajustadas (mais à direita, pisando no chão)
            const dragonX = config.width * 1.05; // Movido ainda mais para a direita
            // Ajuste para o dragão 'pisar' no chão (valor NEGATIVO para subir o dragão)
            const dragonYOffsetFromGround = 120; // Revertido para a posição anterior
            this.dragon = this.physics.add.sprite(dragonX, config.height - dragonYOffsetFromGround, 'dragon_frame_0'); 
            this.dragon.setScale(1.2); // Aumenta a escala do dragão
            this.dragon.setImmovable(true); 
            this.dragon.body.setAllowGravity(false); 
            this.dragon.anims.play('dragon_anim', true); 
    
            // Ajusta hitbox do dragão (se necessário, recalcular com a nova escala)
            this.dragon.body.setSize(174 * 1.2 * 0.8, 103 * 1.2 * 0.9); // Ajuste a hitbox com a nova escala
            this.dragon.body.setOffset((174 * 1.2 * (1 - 0.8)) / 2, (103 * 1.2 * (1 - 0.9)) / 2);
    
            // Vira o dragão para o Dovahkiin
            if (this.player.x < this.dragon.x) {
                this.dragon.setFlipX(true); 
            } else {
                this.dragon.setFlipX(false); 
            }
    
            // Mensagens temporárias de cutscene
            this.add.text(config.width / 2, 80, 'Parabéns! Você concluiu a primeira fase.', { 
                fontSize: '24px',
                fill: '#FFF',
                backgroundColor: '#00000080',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);
    
            this.add.text(config.width / 2, 130, 'Prepare-se para a próxima aventura!', { 
                fontSize: '18px',
                fill: '#FFF',
                backgroundColor: '#00000080',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);
    
            // Posição centralizada acima do personagem principal
            const initialTextX = this.player.x; 
            const textYAbovePlayer = this.player.y - this.player.displayHeight / 2 - 50; 
    
            // Texto "FIM DA DEMO" (invisível inicialmente)
            this.endDemoText = this.add.text(
                initialTextX, 
                textYAbovePlayer, 
                'FIM DA DEMO', 
                {
                    fontSize: '48px',
                    fill: '#FF0000',
                    backgroundColor: '#00000080',
                    padding: { x: 20, y: 10 }
                }
            ).setOrigin(0.5).setAlpha(0); 
    
            // Texto "Obrigado por jogar SKYRIM BLM" (invisível inicialmente)
            this.thanksForPlayingText = this.add.text(
                initialTextX, 
                textYAbovePlayer + 70, 
                'Obrigado por jogar SKYRIM BLM', 
                {
                    fontSize: '24px',
                    fill: '#FFFFFF',
                    backgroundColor: '#00000080',
                    padding: { x: 15, y: 8 }
                }
            ).setOrigin(0.5).setAlpha(0); 
    
            // Adiciona o logo do Skyrim (inicialmente invisível) e diminui sua escala e baixa a posição
            this.skyrimLogo = this.add.image(initialTextX, textYAbovePlayer + 270, 'skyrim_logo'); // Posição ainda mais baixa
            this.skyrimLogo.setOrigin(0.5).setAlpha(0); // Começa invisível
            this.skyrimLogo.setScale(0.1); // Diminui ainda mais a escala do logo
    
            // Inicia a sequência da cutscene
            this.startCutsceneSequence();
        }
    
        startCutsceneSequence() {
            this.player.anims.play('run_cutscene', true); 
    
            // Tween para o player caminhar e a câmera afastar o zoom
            this.tweens.add({
                targets: this.player,
                x: config.width * 0.7, 
                duration: 6000, 
                ease: 'Linear',
                onUpdate: () => {
                    if (this.player.x >= config.width * 0.5 && this.cameras.main.zoom > 1) {
                        const zoomProgress = (this.player.x - config.width * 0.5) / (config.width * 0.7 - config.width * 0.5);
                        this.cameras.main.setZoom(Phaser.Math.Linear(2, 1, zoomProgress));
                    }
                },
                onComplete: () => {
                    this.player.anims.play('idle_cutscene', true); 
                    this.cameras.main.setZoom(1);
    
                    // Centraliza o texto e o logo
                    this.endDemoText.x = this.player.x;
                    this.endDemoText.y = this.player.y - this.player.displayHeight / 2 - 50;
    
                    this.thanksForPlayingText.x = this.player.x;
                    this.thanksForPlayingText.y = this.player.y - this.player.displayHeight / 2 - 50 + 70; 
    
                    this.skyrimLogo.x = this.player.x; // Centraliza o logo com o player
                    this.skyrimLogo.y = this.player.y - this.player.displayHeight / 2 - 50 + 270; // Posição ainda mais baixa
    
                    // Exibe o texto "FIM DA DEMO"
                    this.tweens.add({
                        targets: this.endDemoText,
                        alpha: 1, 
                        duration: 1000,
                        ease: 'Linear',
                        onComplete: () => {
                            // Exibe o texto "Obrigado por jogar..."
                            this.tweens.add({
                                targets: this.thanksForPlayingText,
                                alpha: 1,
                                duration: 1000,
                                ease: 'Linear',
                                delay: 500,
                                onComplete: () => {
                                    // Exibe o logo do Skyrim por último
                                    this.tweens.add({
                                        targets: this.skyrimLogo,
                                        alpha: 1,
                                        duration: 1000,
                                        ease: 'Linear',
                                        delay: 500
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    
        update() {
            for (let i = 0; i < this.parallaxLayers.length; i++) {
                this.parallaxLayers[i].obj.tilePositionX = this.cameras.main.scrollX * this.parallaxLayers[i].factor;
            }
        }
    }
    
    // ====================================================================
    // NOVA CENA: GameOverScene
    // ====================================================================
    class GameOverScene extends Phaser.Scene {
        constructor() {
            super({ key: 'GameOverScene' });
        }
    
        // Método init para receber dados da cena anterior
        init(data) {
            this.finalDraugrKills = data.draugrKills || 0;
        }
    
        create() {
            // Overlay de fundo escuro
            this.add.rectangle(config.width / 2, config.height / 2, config.width, config.height, 0x000000, 0.8).setOrigin(0.5);
    
            // Texto "GAME OVER"
            this.add.text(config.width / 2, config.height / 2 - 80, 'GAME OVER', {
                fontSize: '64px',
                fill: '#FF0000',
                fontFamily: 'Impact, sans-serif', 
            }).setOrigin(0.5);
    
            // Contagem final de Draugrs
            this.add.text(config.width / 2, config.height / 2 - 10, `Draugrs Derrotados: ${this.finalDraugrKills}`, {
                fontSize: '24px',
                fill: '#FFFFFF',
            }).setOrigin(0.5);
    
            // Botão "REINICIAR"
            const restartButton = this.add.text(config.width / 2, config.height / 2 + 80, 'REINICIAR', {
                fontSize: '32px',
                fill: '#FFFFFF',
                backgroundColor: '#008000', // Verde
                padding: { x: 20, y: 10 },
                // Phaser 3 não suporta borderRadius diretamente em estilo de texto.
                // Para cantos arredondados, precisaríamos de um sprite ou graphic por baixo.
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
            // Eventos do botão para feedback visual
            restartButton.on('pointerdown', () => {
                restartButton.setStyle({ backgroundColor: '#006400' }); // Verde mais escuro ao clicar
                this.scene.start('MainGameScene'); // Reinicia a cena principal do jogo
            });
    
            restartButton.on('pointerover', () => {
                restartButton.setStyle({ backgroundColor: '#00B000' }); // Verde mais claro ao passar o mouse
            });
    
            restartButton.on('pointerout', () => {
                restartButton.setStyle({ backgroundColor: '#008000' }); // Volta ao verde original
            });
        }
    }
    
    
    // ====================================================================
    // CENA PRINCIPAL DO JOGO
    // ====================================================================
    class MainGameScene extends Phaser.Scene {
        constructor() {
            super({ key: 'MainGameScene' });
        }
    
        preload() {
            this.player;
            this.platforms;
            this.groundRectangle;
            this.draugrGroup; 
            this.portal; 
            this.keys; 
            this.isAttacking = false; 
            this.playerAttackHitbox; 
            this.parallaxLayers = []; 
            this.initialPlayerY; 
            this.canEnterPortal = true; 
    
            // Variáveis de áudio e UI
            this.generalSFXVolume = 0.5; 
            this.ambientMusicVolume = 0.5; 
            this.playerWalkSound;    
            this.jumpSound;          
            this.playerTakeHitSound; 
            this.playerAttackSound;  
            this.playerDeathSound;   
            this.draugrAttackSound;  
            this.draugrDeathSound;   
            this.ambientMusic;       
            this.sfxVolumeText;   
            this.musicVolumeText; 
            this.settingsPanel; 
            this.isPlayerWalking = false; 
    
            // Variáveis das barras de vida e estamina
            this.uiBarsEmptyTexture;  
            this.uiBarsFullTexture;   
            this.uiBarsMaskGraphics;  
    
            this.UI_BARS_WIDTH = 222; 
            this.UI_BARS_HEIGHT = 30; 
            this.UI_BARS_OFFSET_X = 20;
            this.UI_BARS_OFFSET_Y = 20;
            this.PLAYER_MAX_HEALTH = 100;
            this.HEALTH_BAR_MASK_X_OFFSET = 0 * 2;   
            this.HEALTH_BAR_MASK_Y_OFFSET = 1 * 2;   
            this.HEALTH_BAR_MASK_WIDTH_MAX = 111 * 2; 
            this.HEALTH_BAR_MASK_HEIGHT = 5 * 2;     
            this.PLAYER_MAX_STAMINA = 5;
            this.playerStamina = this.PLAYER_MAX_STAMINA;
            this.STAMINA_REGEN_RATE = 1;
            this.STAMINA_COST_PER_ATTACK = 1;
            this.canAttack = true;
            this.STAMINA_BAR_MASK_X_OFFSET = 0 * 2;    
            this.STAMINA_BAR_MASK_Y_OFFSET = 8 * 2;    
            this.STAMINA_BAR_MASK_WIDTH_MAX = 111 * 2; 
            this.STAMINA_BAR_MASK_HEIGHT = 5 * 2;      
    
            // Variáveis do portal e draugrs
            this.draugrKills = 0; 
            this.TOTAL_DRAUGRS_TO_KILL = 5; 
            this.killCountText; 
            this.portalMessageText; 
    
            // Largura do mundo do jogo
            this.WORLD_WIDTH = 960 * 3; 
    
            // Carrega spritesheets do Dovahkiin
            this.load.spritesheet('dovahkiin_idle', 'assets/Idle.png', { frameWidth: 162, frameHeight: 162 });
            this.load.spritesheet('dovahkiin_run', 'assets/Run.png', { frameWidth: 162, frameHeight: 162 });
            this.load.spritesheet('dovahkiin_jump', 'assets/Jump.png', { frameWidth: 162, frameHeight: 162 });
            this.load.spritesheet('dovahkiin_fall', 'assets/Fall.png', { frameWidth: 162, frameHeight: 162 });
            this.load.spritesheet('dovahkiin_attack1', 'assets/Attack1.png', { frameWidth: 162, frameHeight: 162 });
            this.load.spritesheet('dovahkiin_attack2', 'assets/Attack2.png', { frameWidth: 162, frameHeight: 162 });
            this.load.spritesheet('dovahkiin_attack3', 'assets/Attack3.png', { frameWidth: 162, frameHeight: 162 });
            this.load.spritesheet('dovahkiin_death', 'assets/Death.png', { frameWidth: 162, frameHeight: 162 });
            this.load.spritesheet('dovahkiin_take_hit', 'assets/Take hit.png', { frameWidth: 162, frameHeight: 162 });
    
            // Carrega spritesheets do Draugr
            this.load.spritesheet('draugr_idle', 'assets/draugr/Idle.png', { frameWidth: 150, frameHeight: 150 });
            this.load.spritesheet('draugr_walk', 'assets/draugr/Walk.png', { frameWidth: 150, frameHeight: 150 });
            this.load.spritesheet('draugr_attack', 'assets/draugr/Attack.png', { frameWidth: 150, frameHeight: 150 });
            this.load.spritesheet('draugr_take_hit', 'assets/draugr/Take Hit.png', { frameWidth: 150, frameHeight: 150 });
            this.load.spritesheet('draugr_death', 'assets/draugr/Death.png', { frameWidth: 150, frameHeight: 150 });
    
            // Carrega camadas de fundo parallax
            this.load.image('parallax_layer_0', 'assets/background/sky.png');         
            this.load.image('parallax_layer_1', 'assets/background/sky_cloud.png');  
            this.load.image('parallax_layer_2', 'assets/background/cloud.png');      
            this.load.image('parallax_layer_3', 'assets/background/mountain2.png');  
            this.load.image('parallax_layer_4', 'assets/background/pine1.png');      
            this.load.image('parallax_layer_5', 'assets/background/pine2.png');      
    
            // Carrega assets de cenário
            for (let i = 1; i <= 11; i++) {
                this.load.image(`ground_${i}`, `assets/Ground/ground_${i}.png`);
            }
            for (let i = 1; i <= 5; i++) {
                this.load.image(`grass_${i}`, `assets/Grass/grass_${i}.png`);
            }
            this.load.image('bush_1', 'assets/bush/bush_1.png');
            this.load.image('bush_2', 'assets/bush/bush_2.png');
            this.load.image('rock_1', 'assets/Rock/rock_1.png');
            this.load.image('rock_2', 'assets/Rock/rock_2.png');
            this.load.image('tree', 'assets/Tree/tree.png');
            this.load.image('tree_dead', 'assets/Tree/tree_dead.png');
    
            // Carrega assets de UI
            this.load.image('ui_bars_full_texture', 'assets/life bar/barras.png'); 
            this.load.image('ui_bars_empty_texture', 'assets/life bar/barras_vazias.png'); 
    
            // Carrega áudios
            this.load.audio('ambient_music', 'assets/sounds/musica_ambiente.mp3'); 
            this.load.audio('jump_sfx', 'assets/sounds/jump.mp3');           
            this.load.audio('player_walk_sfx', 'assets/sounds/run.mp3');     
            this.load.audio('player_take_hit_sfx', 'assets/sounds/palyer dano.mp3'); 
            this.load.audio('player_attack_sfx', 'assets/sounds/player attack.mp3'); 
            this.load.audio('player_death_sfx', 'assets/sounds/death player.mp3'); 
            this.load.audio('draugr_attack_sfx', 'assets/sounds/draugter atack.mp3'); 
            this.load.audio('draugr_death_sfx', 'assets/sounds/draugr death.mp3');   
    
            // Carrega spritesheet do portal
            this.load.spritesheet('portal_anim_sprite', 'assets/gate/spr_portal_strip8.png', {
                frameWidth: 128, 
                frameHeight: 128
            });
        }
    
        create() {
            this.parallaxLayers = []; 
    
            const parallaxConfig = [
                { key: 'parallax_layer_0', factor: 0.05, yOffsetFromBottom: 0, isFullHeight: true },
                { key: 'parallax_layer_1', factor: 0.1, yOffsetFromBottom: 220, isFullHeight: false },
                { key: 'parallax_layer_2', factor: 0.15, yOffsetFromBottom: 330, isFullHeight: false },
                { key: 'parallax_layer_3', factor: 0.2, yOffsetFromBottom: 150, isFullHeight: false },
                { key: 'parallax_layer_4', factor: 0.25, yOffsetFromBottom: 60, isFullHeight: false },
                { key: 'parallax_layer_5', factor: 0.3, yOffsetFromBottom: 0, isFullHeight: false }
            ];
    
            parallaxConfig.forEach(layerConfig => {
                const texture = this.textures.get(layerConfig.key);
                if (!texture) {
                    console.warn(`Texture ${layerConfig.key} not found for parallax layer.`);
                    return;
                }
                const imageHeight = texture.source[0].height; 
    
                let layer;
                if (layerConfig.isFullHeight) {
                    layer = this.add.tileSprite(0, 0, this.WORLD_WIDTH, config.height, layerConfig.key).setOrigin(0, 0);
                } else {
                    layer = this.add.tileSprite(0, config.height - imageHeight - layerConfig.yOffsetFromBottom, this.WORLD_WIDTH, imageHeight, layerConfig.key).setOrigin(0, 0);
                }
                
                layer.setScrollFactor(0); 
                this.parallaxLayers.push({ obj: layer, factor: layerConfig.factor }); 
            });
    
            // Criação do grupo estático para o chão
            this.platforms = this.physics.add.staticGroup();
    
            // Criação do retângulo do chão
            this.groundRectangle = this.add.rectangle(
                this.WORLD_WIDTH / 2,         
                config.height - 32,      
                this.WORLD_WIDTH,             
                64,                      
                0x333333                 
            );
            this.platforms.add(this.groundRectangle);
    
            // Posição Y inicial do jogador
            this.initialPlayerY = config.height - 101.2; 
    
            this.player = this.physics.add.sprite(100, this.initialPlayerY, 'dovahkiin_idle'); 
            this.player.health = this.PLAYER_MAX_HEALTH; 
            this.player.setBounce(0.1); 
            this.player.setCollideWorldBounds(true); 
            this.player.body.world.setBounds(0, 0, this.WORLD_WIDTH, config.height + 100); 
            this.player.setData('isTakingHit', false); 
            this.player.setGravityY(600); 
            this.player.setDepth(1); 
    
            // Ajusta caixa de colisão do jogador
            this.player.body.setSize(60, 57); 
            this.player.body.setOffset(51, 45); 
    
            // Cria Animações do Dovahkiin
            this.anims.create({ key: 'idle', frames: this.anims.generateFrameNumbers('dovahkiin_idle', { start: 0, end: 9 }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: 'run', frames: this.anims.generateFrameNumbers('dovahkiin_run', { start: 0, end: 7 }), frameRate: 15, repeat: -1 });
            this.anims.create({ key: 'jump', frames: this.anims.generateFrameNumbers('dovahkiin_jump', { start: 0, end: 2 }), frameRate: 10, repeat: 0 });
            this.anims.create({ key: 'fall', frames: this.anims.generateFrameNumbers('dovahkiin_fall', { start: 0, end: 2 }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: 'attack1', frames: this.anims.generateFrameNumbers('dovahkiin_attack1', { start: 0, end: 6 }), frameRate: 20, repeat: 0 });
            this.anims.create({ key: 'attack2', frames: this.anims.generateFrameNumbers('dovahkiin_attack2', { start: 0, end: 6 }), frameRate: 20, repeat: 0 });
            this.anims.create({ key: 'attack3', frames: this.anims.generateFrameNumbers('dovahkiin_attack3', { start: 0, end: 7 }), frameRate: 20, repeat: 0 });
            this.anims.create({ key: 'death', frames: this.anims.generateFrameNumbers('dovahkiin_death', { start: 0, end: 6 }), frameRate: 8, repeat: 0 });
            this.anims.create({ key: 'take_hit', frames: this.anims.generateFrameNumbers('dovahkiin_take_hit', { start: 0, end: 2 }), frameRate: 10, repeat: 0 });
    
            // Cria Animações do Draugr
            this.anims.create({ key: 'draugr_idle', frames: this.anims.generateFrameNumbers('draugr_idle', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: 'draugr_walk', frames: this.anims.generateFrameNumbers('draugr_walk', { start: 0, end: 3 }), frameRate: 15, repeat: -1 });
            this.anims.create({ key: 'draugr_attack', frames: this.anims.generateFrameNumbers('draugr_attack', { start: 0, end: 7 }), frameRate: 15, repeat: 0 });
            this.anims.create({ key: 'draugr_take_hit', frames: this.anims.generateFrameNumbers('draugr_take_hit', { start: 0, end: 3 }), frameRate: 10, repeat: 0 });
            this.anims.create({ key: 'draugr_death', frames: this.anims.generateFrameNumbers('draugr_death', { start: 0, end: 3 }), frameRate: 8, repeat: 0 });
    
            // Player colide com o chão
            this.physics.add.collider(this.player, this.platforms);
    
            // Cria elementos UI para barras de vida e estamina
            this.uiBarsEmptyTexture = this.add.image(this.UI_BARS_OFFSET_X, this.UI_BARS_OFFSET_Y, 'ui_bars_empty_texture').setOrigin(0, 0).setScrollFactor(0).setAlpha(1).setDepth(2); 
            this.uiBarsEmptyTexture.displayWidth = this.UI_BARS_WIDTH; 
            this.uiBarsEmptyTexture.displayHeight = this.UI_BARS_HEIGHT; 
    
            this.uiBarsFullTexture = this.add.image(this.UI_BARS_OFFSET_X, this.UI_BARS_OFFSET_Y + 1, 'ui_bars_full_texture').setOrigin(0, 0).setScrollFactor(0).setAlpha(1).setDepth(1); 
            this.uiBarsFullTexture.displayWidth = this.UI_BARS_WIDTH; 
            this.uiBarsFullTexture.displayHeight = 13 * 2; 
    
            this.uiBarsMaskGraphics = this.make.graphics(); 
            this.uiBarsMaskGraphics.setScrollFactor(0); 
            this.uiBarsMaskGraphics.setVisible(false); 
    
            this.uiBarsFullTexture.setMask(new Phaser.Display.Masks.GeometryMask(this, this.uiBarsMaskGraphics));
    
            this.player.health = this.PLAYER_MAX_HEALTH;
            this.playerStamina = this.PLAYER_MAX_STAMINA;
    
            // Captura teclas específicas
            this.keys = this.input.keyboard.addKeys({
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D,
                jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
                interact: Phaser.Input.Keyboard.KeyCodes.E 
            });
    
            // Lógica de clique do mouse para ataque
            this.input.on('pointerdown', function (pointer) {
                if (pointer.leftButtonDown()) { 
                    this.attackHandler(); 
                } 
            }, this); 
    
            // Cria playerAttackHitbox
            this.playerAttackHitbox = this.add.rectangle(0, 0, 1, 1, 0xffffff, 0); 
            this.physics.world.enable(this.playerAttackHitbox);
            this.playerAttackHitbox.body.setAllowGravity(false); 
            this.playerAttackHitbox.body.enable = false; 
    
            // Adiciona Draugrs (5 no total)
            this.draugrGroup = this.physics.add.group(); 
    
            const draugrPositions = [
                { x: this.WORLD_WIDTH * 0.2, y: config.height - 91 }, 
                { x: this.WORLD_WIDTH * 0.4, y: config.height - 91 }, 
                { x: this.WORLD_WIDTH * 0.6, y: config.height - 91 }, 
                { x: this.WORLD_WIDTH * 0.75, y: config.height - 91 }, 
                { x: this.WORLD_WIDTH * 0.9, y: config.height - 91 }  
            ];
    
            draugrPositions.forEach((pos, index) => {
                let currentDraugr = this.physics.add.sprite(pos.x, pos.y, 'draugr_idle');
                currentDraugr.setCollideWorldBounds(true);
                currentDraugr.setGravityY(600); 
                currentDraugr.setImmovable(false);
                currentDraugr.health = 5;
                currentDraugr.setData('isTakingHit', false);
                currentDraugr.setData('isDead', false);
                currentDraugr.patrolDirection = (index % 2 === 0) ? 1 : -1; 
                currentDraugr.lastAttackTime = 0;
                currentDraugr.detectionRange = 300;
    
                // Cria hitbox de ataque para cada Draugr
                currentDraugr.attackHitbox = this.add.rectangle(0, 0, 40, 40, 0x00ff00, 0);
                this.physics.world.enable(currentDraugr.attackHitbox);
                currentDraugr.attackHitbox.body.setAllowGravity(false);
                currentDraugr.attackHitbox.body.moves = false;
                currentDraugr.attackHitbox.body.enable = false;
                currentDraugr.attackHitbox.setVisible(false); 
                currentDraugr.attackCooldown = 1500;
    
                currentDraugr.body.setSize(60, 62);
                currentDraugr.body.setOffset(45, 40);
                currentDraugr.anims.play('draugr_idle', true);
    
                this.draugrGroup.add(currentDraugr); 
    
                // Draugr colide com o chão
                this.physics.add.collider(currentDraugr, this.platforms);
    
                this.physics.add.overlap(currentDraugr.attackHitbox, this.player, (hitbox, player) => {
                    if (currentDraugr.anims.currentAnim.key === 'draugr_attack' && !player.getData('isTakingHit') && !currentDraugr.getData('isDead') && !currentDraugr.getData('isTakingHit')) {
                        this.playerTakeHit(this, player, currentDraugr); 
                    }
                }, null, this);
            });
    
            this.physics.add.overlap(this.playerAttackHitbox, this.draugrGroup, this.playerAttackDraugr, null, this);
    
            // Cria e configura o Portal
            this.anims.create({
                key: 'portal_anim',
                frames: this.anims.generateFrameNumbers('portal_anim_sprite', { start: 0, end: 7 }),
                frameRate: 10,
                repeat: -1
            });
            
            this.portal = this.physics.add.sprite(this.WORLD_WIDTH - 200, config.height - 96 - 30, 'portal_anim_sprite'); 
            this.portal.play('portal_anim');
            this.portal.setImmovable(true); 
            this.portal.body.setAllowGravity(false); 
            this.portal.body.setSize(80, 120); 
            this.portal.body.setOffset(24, 0); 
            this.portal.setVisible(false); 
            this.portal.setDepth(0); 
            
            // Portal colide com o chão
            this.physics.add.collider(this.portal, this.platforms);
    
            this.physics.add.overlap(this.player, this.portal, this.handlePortalInteraction, null, this);
    
            // Configura a câmera para seguir o jogador
            this.cameras.main.setBounds(0, 0, this.WORLD_WIDTH, config.height); 
            this.cameras.main.startFollow(this.player, true, 0.05, 0.05); 
            this.cameras.main.yOffset = -150; 
    
            // Cria objetos de som
            this.jumpSound = this.sound.add('jump_sfx', { volume: this.generalSFXVolume });
            this.playerWalkSound = this.sound.add('player_walk_sfx', { loop: true, volume: this.generalSFXVolume });
            this.playerTakeHitSound = this.sound.add('player_take_hit_sfx', { volume: this.generalSFXVolume });
            this.playerAttackSound = this.sound.add('player_attack_sfx', { volume: this.generalSFXVolume });
            this.playerDeathSound = this.sound.add('player_death_sfx', { volume: this.generalSFXVolume });
            this.draugrAttackSound = this.sound.add('draugr_attack_sfx', { volume: this.generalSFXVolume });
            this.draugrDeathSound = this.sound.add('draugr_death_sfx', { volume: this.generalSFXVolume });
            this.ambientMusic = this.sound.add('ambient_music', { loop: true, volume: this.ambientMusicVolume });
    
            // Inicializa o volume para todos os sons SFX e música ambiente
            this.sound.volume = this.generalSFXVolume; // Define o volume global para SFX
            if (this.ambientMusic) {
                this.ambientMusic.setVolume(this.ambientMusicVolume);
            }
    
            if (this.cache.audio.exists('ambient_music')) { 
                this.ambientMusic.play(); 
            } else {
                console.warn('Música de ambiente não encontrada. Verifique o nome do arquivo e o caminho.');
            }
    
            // Botão para abrir painel de configurações
            let settingsButton = this.add.text(config.width - 10, 16, '[ Configurações ]', { fontSize: '20px', fill: '#FFF', backgroundColor: '#333', padding: { x: 8, y: 4 } })
                .setInteractive({ useHandCursor: true })
                .setOrigin(1, 0) 
                .setScrollFactor(0); 
            settingsButton.on('pointerdown', this.toggleSettingsPanel, this); 
    
            // Cria painel de configurações (inicialmente oculto)
            this.settingsPanel = this.add.container(config.width / 2, config.height / 2);
            this.settingsPanel.setScrollFactor(0); 
            this.settingsPanel.setDepth(100); 
            this.settingsPanel.setVisible(false); 
    
            let panelBackground = this.add.rectangle(0, 0, 400, 250, 0x000000, 0.8); 
            panelBackground.setStrokeStyle(2, 0xFFFFFF, 1); 
            this.settingsPanel.add(panelBackground);
    
            let panelTitle = this.add.text(0, -90, 'Configurações de Áudio', { fontSize: '20px', fill: '#FFF' }).setOrigin(0.5);
            this.settingsPanel.add(panelTitle);
    
            let sfxLabel = this.add.text(-120, -30, 'Volume SFX:', { fontSize: '20px', fill: '#FFF' }).setOrigin(0, 0.5);
            let sfxDecreaseButtonPanel = this.add.text(20, -30, '[ - ]', { fontSize: '20px', fill: '#FFF', backgroundColor: '#555', padding: { x: 6, y: 2 } })
                .setInteractive({ useHandCursor: true })
                .setOrigin(0.5);
            sfxDecreaseButtonPanel.on('pointerdown', function() {
                this.scene.decreaseSFXVolume(); 
            });
            sfxDecreaseButtonPanel.on('pointerup', function() { this.clearTint(); });
            sfxDecreaseButtonPanel.on('pointerout', function() { this.clearTint(); });
    
            this.sfxVolumeText = this.add.text(90, -30, `${Math.round(this.generalSFXVolume * 100)}%`, { fontSize: '20px', fill: '#FFF' }).setOrigin(0.5);
            let sfxIncreaseButtonPanel = this.add.text(160, -30, '[ + ]', { fontSize: '20px', fill: '#FFF', backgroundColor: '#555', padding: { x: 6, y: 2 } })
                .setInteractive({ useHandCursor: true })
                .setOrigin(0.5);
            sfxIncreaseButtonPanel.on('pointerdown', function() {
                this.scene.increaseSFXVolume(); 
            });
            sfxIncreaseButtonPanel.on('pointerup', function() { this.clearTint(); });
            sfxIncreaseButtonPanel.on('pointerout', function() { this.clearTint(); });
    
            this.settingsPanel.add([sfxLabel, sfxDecreaseButtonPanel, this.sfxVolumeText, sfxIncreaseButtonPanel]);
    
            let musicLabel = this.add.text(-120, 30, 'Volume Música:', { fontSize: '20px', fill: '#FFF' }).setOrigin(0, 0.5);
            let musicDecreaseButtonPanel = this.add.text(20, 30, '[ - ]', { fontSize: '20px', fill: '#FFF', backgroundColor: '#555', padding: { x: 6, y: 2 } })
                .setInteractive({ useHandCursor: true })
                .setOrigin(0.5);
            musicDecreaseButtonPanel.on('pointerdown', function() {
                this.scene.decreaseAmbientVolume(); 
            });
            musicDecreaseButtonPanel.on('pointerup', function() { this.clearTint(); });
            musicDecreaseButtonPanel.on('pointerout', function() { this.clearTint(); });
    
            this.musicVolumeText = this.add.text(90, 30, `${Math.round(this.ambientMusicVolume * 100)}%`, { fontSize: '20px', fill: '#FFF' }).setOrigin(0.5);
            let musicIncreaseButtonPanel = this.add.text(160, 30, '[ + ]', { fontSize: '20px', fill: '#FFF', backgroundColor: '#555', padding: { x: 6, y: 2 } })
                .setInteractive({ useHandCursor: true })
                .setOrigin(0.5);
            musicIncreaseButtonPanel.on('pointerdown', function() {
                this.scene.increaseAmbientVolume(); 
            });
            musicIncreaseButtonPanel.on('pointerup', function() { this.clearTint(); });
            musicIncreaseButtonPanel.on('pointerout', function() { this.clearTint(); });
    
            this.settingsPanel.add([musicLabel, musicDecreaseButtonPanel, this.musicVolumeText, musicIncreaseButtonPanel]);
    
            let closeButton = this.add.text(170, -110, 'X', { fontSize: '20px', fill: '#FFF', backgroundColor: '#880000', padding: { x: 8, y: 4 } })
                .setInteractive({ useHandCursor: true })
                .setOrigin(0.5);
            closeButton.on('pointerdown', this.toggleSettingsPanel, this);
            this.settingsPanel.add(closeButton);
    
            this.updateVolumeDisplay();
    
            // Texto do contador de draugrs mortos
            this.killCountText = this.add.text(this.UI_BARS_OFFSET_X, this.UI_BARS_OFFSET_Y + this.UI_BARS_HEIGHT + 10, `Draugrs Derrotados: ${this.draugrKills}/${this.TOTAL_DRAUGRS_TO_KILL}`, { fontSize: '16px', fill: '#FFF' })
                .setScrollFactor(0)
                .setDepth(2); 
    
            // Texto de mensagem do portal
            this.portalMessageText = this.add.text(this.portal.x, this.portal.y - 80, '', { 
                fontSize: '20px',
                fill: '#FFFF00', 
                backgroundColor: '#000',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5)
            .setScrollFactor(1) 
            .setDepth(1); 
            this.portalMessageText.setVisible(false); 
        }
    
        update(time, delta) { 
            if (this.player.active) {
                this.uiBarsMaskGraphics.clear(); 
                this.uiBarsMaskGraphics.fillStyle(0x000000, 1); 
    
                const healthMaskWidth = (this.player.health / this.PLAYER_MAX_HEALTH) * this.HEALTH_BAR_MASK_WIDTH_MAX;
                this.uiBarsMaskGraphics.fillRect(
                    this.UI_BARS_OFFSET_X + this.HEALTH_BAR_MASK_X_OFFSET,
                    this.UI_BARS_OFFSET_Y + this.HEALTH_BAR_MASK_Y_OFFSET,
                    healthMaskWidth,
                    this.HEALTH_BAR_MASK_HEIGHT
                );
    
                const staminaMaskWidth = (this.playerStamina / this.PLAYER_MAX_STAMINA) * this.STAMINA_BAR_MASK_WIDTH_MAX;
                this.uiBarsMaskGraphics.fillRect(
                    this.UI_BARS_OFFSET_X + this.STAMINA_BAR_MASK_X_OFFSET,
                    this.UI_BARS_OFFSET_Y + this.STAMINA_BAR_MASK_Y_OFFSET,
                    staminaMaskWidth,
                    this.STAMINA_BAR_MASK_HEIGHT
                );
    
                this.uiBarsEmptyTexture.setVisible(true);
                this.uiBarsFullTexture.setVisible(true);
    
            } else {
                this.uiBarsEmptyTexture.setVisible(false);
                this.uiBarsFullTexture.setVisible(false);
                this.uiBarsMaskGraphics.clear(); 
            }
    
            if (this.player.active && !this.isAttacking && this.playerStamina < this.PLAYER_MAX_STAMINA) {
                this.playerStamina = Math.min(this.PLAYER_MAX_STAMINA, this.playerStamina + this.STAMINA_REGEN_RATE * (delta / 1000)); 
            }
    
            for (let i = 0; i < this.parallaxLayers.length; i++) {
                this.parallaxLayers[i].obj.tilePositionX = this.cameras.main.scrollX * this.parallaxLayers[i].factor;
            }
    
            if (this.player.health <= 0) {
                if (this.player.active) { 
                    this.player.anims.play('death', true); 
                    this.playerDeathSound.play(); 
                    if (this.playerWalkSound.isPlaying) {
                        this.playerWalkSound.stop();
                        this.isPlayerWalking = false;
                    }
                    this.player.once('animationcomplete-death', () => {
                        // Transita para a tela de Game Over
                        this.scene.start('GameOverScene', { draugrKills: this.draugrKills }); 
                    });
                }
                return; 
            }
    
            if (this.player.y > config.height + 50) { 
                this.player.setPosition(100, this.initialPlayerY); 
                this.player.setVelocity(0, 0); 
                this.player.health = this.PLAYER_MAX_HEALTH; 
                this.playerStamina = this.PLAYER_MAX_STAMINA; 
                if (this.playerWalkSound.isPlaying) {
                    this.playerWalkSound.stop();
                    this.isPlayerWalking = false;
                }
            }
    
            if (this.isAttacking) {
                if (this.keys.left.isDown) {
                    this.player.setVelocityX(-100); 
                    this.player.setFlipX(true); 
                } else if (this.keys.right.isDown) {
                    this.player.setVelocityX(100); 
                    this.player.setFlipX(false); 
                } else {
                    this.player.setVelocityX(0);
                }
                if (!this.player.anims.isPlaying || !(this.player.anims.currentAnim.key.startsWith('attack')) || (this.player.anims.currentFrame && this.player.anims.currentFrame.index === this.player.anims.currentAnim.frames.length - 1)) {
                    this.isAttacking = false;
                    this.playerAttackHitbox.body.enable = false; 
                    this.playerAttackHitbox.setVisible(false); 
                    this.player.clearTint(); 
                }
                if (this.playerWalkSound.isPlaying) {
                    this.playerWalkSound.stop();
                    this.isPlayerWalking = false;
                }
                return; 
            }
    
            if (this.player.getData('isTakingHit')) {
                if (this.player.body.velocity.x === 0) { 
                     this.player.setVelocityX(0);
                }
                if (this.player.anims.currentAnim.key !== 'take_hit') {
                    this.player.anims.play('take_hit', true);
                }
                this.player.setTint(0xff0000); 
                if (this.playerWalkSound.isPlaying) {
                    this.playerWalkSound.stop();
                    this.isPlayerWalking = false;
                }
                return; 
            }
    
            const isMovingHorizontally = this.keys.left.isDown || this.keys.right.isDown;
    
            if (isMovingHorizontally) {
                if (this.keys.left.isDown) {
                    this.player.setVelocityX(-200); 
                    this.player.setFlipX(true); 
                } else if (this.keys.right.isDown) {
                    this.player.setVelocityX(200); 
                    this.player.setFlipX(false); 
                }
    
                if (this.player.body.touching.down) { 
                    this.player.anims.play('run', true);
                    if (!this.isPlayerWalking && this.playerWalkSound && !this.playerWalkSound.isPlaying) {
                        this.playerWalkSound.play();
                        this.isPlayerWalking = true;
                    }
                } else { 
                    if (this.playerWalkSound && this.playerWalkSound.isPlaying) {
                        this.playerWalkSound.stop();
                        this.isPlayerWalking = false;
                    }
                }
            } else { 
                this.player.setVelocityX(0); 
                if (this.player.body.touching.down) { 
                    this.player.anims.play('idle', true);
                }
                if (this.playerWalkSound && this.playerWalkSound.isPlaying) {
                    this.playerWalkSound.stop();
                    this.isPlayerWalking = false;
                }
            }
    
            if (this.keys.jump.isDown && this.player.body.touching.down) {
                this.player.setVelocityY(-400); 
                this.player.anims.play('jump', true);
                this.jumpSound.play(); 
                if (this.playerWalkSound && this.playerWalkSound.isPlaying) {
                    this.playerWalkSound.stop();
                    this.isPlayerWalking = false;
                }
            }
            if (!this.player.body.touching.down && this.player.body.velocity.y > 0) {
                this.player.anims.play('fall', true);
                if (this.playerWalkSound && this.playerWalkSound.isPlaying) {
                    this.playerWalkSound.stop();
                    this.isPlayerWalking = false;
                }
            }
    
            this.draugrGroup.children.entries.forEach(draugr => {
                if (draugr && draugr.active) {
                    if (draugr.getData('isDead')) {
                        return;
                    }
                    if (draugr.getData('isTakingHit')) {
                        draugr.setVelocityX(0);
                    } else {
                        const distanceToPlayer = Phaser.Math.Distance.Between(draugr.x, draugr.y, this.player.x, this.player.y);
                        const attackRange = 150;
                        const chaseSpeed = 100;
                        const patrolSpeed = 80;
    
                        const playerIsLeftOfDraugr = this.player.x < draugr.x;
                        draugr.setFlipX(playerIsLeftOfDraugr); 
    
                        if (distanceToPlayer <= attackRange && time > draugr.lastAttackTime + draugr.attackCooldown) {
                            draugr.setVelocityX(0); 
                            draugr.anims.play('draugr_attack', true);
                            this.draugrAttackSound.play();
                            draugr.lastAttackTime = time;
    
                            if (draugr.attackHitbox) {
                                draugr.attackHitbox.body.enable = true;
                                let hitboxOffsetX = draugr.flipX ? -30 : 30;
                                draugr.attackHitbox.x = draugr.x + hitboxOffsetX;
                                draugr.attackHitbox.y = draugr.y;
                                draugr.attackHitbox.setVisible(false); 
                            }
    
                            draugr.once('animationcomplete-draugr_attack', () => {
                                if (draugr.attackHitbox) {
                                    draugr.attackHitbox.body.enable = false;
                                    draugr.attackHitbox.setVisible(false);
                                }
                                if (draugr.active && !draugr.getData('isTakingHit') && !draugr.getData('isDead')) {
                                    if (Phaser.Math.Distance.Between(draugr.x, draugr.y, this.player.x, this.player.y) <= attackRange) {
                                        draugr.anims.play('draugr_idle', true);
                                    } else {
                                        if (distanceToPlayer <= draugr.detectionRange) {
                                            draugr.anims.play('draugr_walk', true);
                                        } else {
                                            draugr.anims.play('draugr_idle', true); 
                                        }
                                    }
                                }
                            });
                        } else if (distanceToPlayer <= draugr.detectionRange) {
                            if (this.player.x < draugr.x) {
                                draugr.setVelocityX(-chaseSpeed);
                            } else {
                                draugr.setVelocityX(chaseSpeed);
                            }
                            draugr.anims.play('draugr_walk', true);
                        } else {
                            draugr.setVelocityX(draugr.patrolDirection * patrolSpeed);
                            draugr.anims.play('draugr_walk', true);
    
                            if (draugr.body.blocked.right || draugr.x >= this.WORLD_WIDTH - 50) {
                                draugr.patrolDirection = -1;
                                draugr.setFlipX(true);
                            } else if (draugr.body.blocked.left || draugr.x <= 50) {
                                draugr.patrolDirection = 1;
                                draugr.setFlipX(false);
                            }
                        }
                    }
                }
            });
    
            if (this.draugrKills >= this.TOTAL_DRAUGRS_TO_KILL) {
                this.portal.setVisible(true);
            } else {
                this.portal.setVisible(false);
            }
        }
    
        attackHandler() {
            if (this.player.body.touching.down && !this.isAttacking && !this.player.getData('isTakingHit') && this.canAttack && this.playerStamina >= this.STAMINA_COST_PER_ATTACK) {
                this.isAttacking = true;
                this.player.setVelocityX(0); 
                
                this.playerStamina -= this.STAMINA_COST_PER_ATTACK;
                this.canAttack = false; 
    
                this.time.delayedCall(300, () => { 
                    this.canAttack = true;
                }, [], this);
    
                const hitboxWidth = 30; 
                const hitboxHeight = 50; 
    
                let hitboxXOffset = this.player.flipX ? -60 : 60; 
                
                this.playerAttackHitbox.x = this.player.x + hitboxXOffset;
                this.playerAttackHitbox.y = this.player.y; 
    
                this.playerAttackHitbox.body.setSize(hitboxWidth, hitboxHeight);
                this.playerAttackHitbox.body.enable = true;
                this.playerAttackHitbox.setVisible(false); 
    
                const attackAnims = ['attack1', 'attack2', 'attack3'];
                const randomAttack = Phaser.Math.RND.pick(attackAnims); 
    
                this.player.anims.play(randomAttack, true);
                this.playerAttackSound.play(); 
    
                this.player.once('animationcomplete', (animation) => {
                    if (animation.key.startsWith('attack')) {
                        this.isAttacking = false;
                        this.playerAttackHitbox.body.enable = false; 
                        this.playerAttackHitbox.setVisible(false); 
                        this.player.clearTint(); 
    
                        if (this.player.body.touching.down) {
                            if (this.keys.left.isDown || this.keys.right.isDown) {
                                this.player.anims.play('run', true);
                            } else {
                                this.player.anims.play('idle', true);
                            }
                        } else { 
                            if (this.player.body.velocity.y > 0) {
                                this.player.anims.play('fall', true);
                            } else {
                                this.player.anims.play('jump', true);
                            }
                        }
                    }
                });
            } 
        }
    
        playerAttackDraugr(playerAttackHitbox, draugrTarget) { 
            if (this.isAttacking && playerAttackHitbox.body.enable && draugrTarget.active && !draugrTarget.getData('isTakingHit') && !draugrTarget.getData('isDead')) { 
                draugrTarget.health -= 1;
                this.playerAttackSound.play(); 
    
                if (draugrTarget.health <= 0) {
                    draugrTarget.anims.play('draugr_death', true);
                    this.draugrDeathSound.play(); 
                    draugrTarget.setData('isDead', true); 
                    draugrTarget.once('animationcomplete-draugr_death', () => {
                        draugrTarget.disableBody(true, true); 
                        this.draugrKills++;
                        this.killCountText.setText(`Draugrs Derrotados: ${this.draugrKills}/${this.TOTAL_DRAUGRS_TO_KILL}`);
                    });
                } else {
                    draugrTarget.anims.play('draugr_take_hit', true);
                    draugrTarget.setData('isTakingHit', true); 
                    draugrTarget.setTint(0xff0000); 
                    draugrTarget.setVelocityX(0); 
    
                    this.time.delayedCall(300, () => { 
                        draugrTarget.setData('isTakingHit', false); 
                        draugrTarget.clearTint(); 
                        if (draugrTarget.active && !draugrTarget.getData('isDead')) { 
                            const distanceToPlayer = Phaser.Math.Distance.Between(draugrTarget.x, draugrTarget.y, this.player.x, this.player.y);
                            const attackRange = 150;
                            const detectionRange = draugrTarget.detectionRange;
    
                            if (distanceToPlayer <= attackRange) {
                                draugrTarget.anims.play('draugr_idle', true); 
                            } else if (distanceToPlayer <= detectionRange) {
                                draugrTarget.anims.play('draugr_walk', true); 
                            } else {
                                draugrTarget.anims.play('draugr_idle', true); 
                            }
                        }
                    }, [], this);
                }
            } 
        }
    
        playerTakeHit(sceneContext, player, draugrAttacker) { 
            if (player.active && !player.getData('isTakingHit') && draugrAttacker.active && !draugrAttacker.getData('isDead')) { 
                player.health -= 10; 
                player.setData('isTakingHit', true); 
                player.anims.play('take_hit', true); 
                player.setTint(0xff0000); 
                this.playerTakeHitSound.play(); 
    
                const knockbackForce = 150;
                player.setVelocityX(player.x > draugrAttacker.x ? knockbackForce : -knockbackForce);
                player.setVelocityY(-50); 
    
                player.once('animationcomplete-take_hit', () => {
                    player.setData('isTakingHit', false); 
                    player.clearTint(); 
                    player.setVelocityX(0); 
    
                    if (player.body.touching.down) {
                        if (this.keys.left.isDown || this.keys.right.isDown) {
                            player.anims.play('run', true);
                        } else {
                            player.anims.play('idle', true);
                        }
                    }
                });
            } 
        }
    
        updateVolumeDisplay() {
            this.sfxVolumeText.setText(`${Math.round(this.generalSFXVolume * 100)}%`);
            this.musicVolumeText.setText(`${Math.round(this.ambientMusicVolume * 100)}%`);
        }
    
        decreaseSFXVolume() {
            this.generalSFXVolume = Math.max(0, this.generalSFXVolume - 0.1); 
            // Aplicar o volume a todos os sons SFX
            this.jumpSound.setVolume(this.generalSFXVolume);
            this.playerWalkSound.setVolume(this.generalSFXVolume);
            this.playerTakeHitSound.setVolume(this.generalSFXVolume);
            this.playerAttackSound.setVolume(this.generalSFXVolume);
            this.playerDeathSound.setVolume(this.generalSFXVolume);
            this.draugrAttackSound.setVolume(this.generalSFXVolume);
            this.draugrDeathSound.setVolume(this.generalSFXVolume);
            this.updateVolumeDisplay(); 
        }
    
        increaseSFXVolume() { 
            this.generalSFXVolume = Math.min(1, this.generalSFXVolume + 0.1); 
            // Aplicar o volume a todos os sons SFX
            this.jumpSound.setVolume(this.generalSFXVolume);
            this.playerWalkSound.setVolume(this.generalSFXVolume);
            this.playerTakeHitSound.setVolume(this.generalSFXVolume);
            this.playerAttackSound.setVolume(this.generalSFXVolume);
            this.playerDeathSound.setVolume(this.generalSFXVolume);
            this.draugrAttackSound.setVolume(this.generalSFXVolume);
            this.draugrDeathSound.setVolume(this.generalSFXVolume);
            this.updateVolumeDisplay();
        }
    
        decreaseAmbientVolume() {
            this.ambientMusicVolume = Math.max(0, this.ambientMusicVolume - 0.1); 
            if (this.ambientMusic) {
                this.ambientMusic.setVolume(this.ambientMusicVolume);
            }
            this.updateVolumeDisplay(); 
        }
    
        increaseAmbientVolume() { 
            this.ambientMusicVolume = Math.min(1, this.ambientMusicVolume + 0.1); 
            if (this.ambientMusic) {
                this.ambientMusic.setVolume(this.ambientMusicVolume);
            }
            this.updateVolumeDisplay();
        }
    
        toggleSettingsPanel() {
            this.settingsPanel.setVisible(!this.settingsPanel.visible);
            if (this.settingsPanel.visible) {
                this.physics.pause();
            } else {
                this.physics.resume();
            }
        }
    
        // Interação do portal requer a tecla 'E' para ativar.
        handlePortalInteraction(player, portal) {
            if (this.draugrKills >= this.TOTAL_DRAUGRS_TO_KILL) {
                if (this.keys.interact.isDown && this.canEnterPortal) { 
                    this.canEnterPortal = false; 
                    this.portalMessageText.setVisible(false);
                    
                    if (this.playerWalkSound && this.playerWalkSound.isPlaying) {
                        this.playerWalkSound.stop();
                        this.isPlayerWalking = false;
                    }
    
                    this.player.setVisible(false); 
                    this.scene.start('CutsceneScene'); 
                    
                } else if (!this.keys.interact.isDown) {
                    this.portalMessageText.setText('Pressione E para entrar no portal');
                    this.portalMessageText.x = portal.x; 
                    this.portalMessageText.setVisible(true);
                    this.canEnterPortal = true; 
                }
    
            } else {
                const remaining = this.TOTAL_DRAUGRS_TO_KILL - this.draugrKills;
                this.portalMessageText.setText(`Derrote mais ${remaining} Draugr(s) para usar o portal!`);
                this.portalMessageText.x = portal.x; 
                this.portalMessageText.setVisible(true);
                this.time.delayedCall(3000, () => { 
                    this.portalMessageText.setVisible(false);
                }, [], this);
                this.canEnterPortal = true; 
            }
        }
    }
    
    // Configuração do Jogo
    const config = {
        type: Phaser.AUTO, 
        width: 960,      
        height: 500,     
        physics: {
            default: 'arcade', 
            arcade: {
                gravity: { y: 600 }, 
                debug: false      // Desativa a visualização das caixas de colisão de depuração
            }
        },
        scene: [MainGameScene, CutsceneScene, GameOverScene] // Adicionada a GameOverScene
    };
    
    // Inicia o jogo
    const game = new Phaser.Game(config);
    
    })();
    