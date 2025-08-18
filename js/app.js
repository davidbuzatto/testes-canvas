const GRAVIDADE = 1200;

let ctx;
let ultimoTempo = 0;
let delta = 0;

let bolinhas = [];
let bolinhaSelecionada;
let largura;
let altura;

let mouseDown = false;
let mouseX;
let mouseY;

class Bolinha {

    constructor( x, y, raio, vx, vy, cor ) {

        this.x = x;
        this.y = y;
        this.raio = raio;

        this.vx = vx;
        this.vy = vy;

        this.cor = cor;

        this.atrito = 0.99;
        this.elasticidade = 0.9;

        this.emArraste = false;
        this.diffX = 0;
        this.diffY = 0;
        this.prevX;
        this.prevY;

    }

    atualizar( largura, altura, delta ) {

        if ( !this.emArraste ) {

            this.x += this.vx * delta;
            this.y += this.vy * delta;

            if ( this.x - this.raio < 0 ) {
                this.x = this.raio;
                this.vx = -this.vx * this.elasticidade;
            } else if ( this.x + this.raio > largura ) {
                this.x = largura - this.raio;
                this.vx = -this.vx * this.elasticidade;
            }

            if ( this.y - this.raio < 0 ) {
                this.y = this.raio;
                this.vy = -this.vy * this.elasticidade;
            } else if ( this.y + this.raio > altura ) {
                this.y = altura - this.raio;
                this.vy = -this.vy * this.elasticidade;
            }

            this.vx = this.vx * this.atrito;
            this.vy = this.vy * this.atrito + GRAVIDADE * delta;

        } else {
            this.x = mouseX - this.diffX;
            this.y = mouseY - this.diffY;
            this.vx = ( this.x - this.prevX ) / delta;
            this.vy = ( this.y - this.prevY ) / delta;
            this.prevX = this.x;
            this.prevY = this.y;
        }

    }

    desenhar( ctx ) {
        ctx.save();
        ctx.fillStyle = this.cor;
        ctx.beginPath();
        ctx.arc( this.x, this.y, this.raio, 0, 2 * Math.PI );
        ctx.fill();
        ctx.restore();
    }

    intersepta( x, y ) {
        let c1 = this.x - x;
        let c2 = this.y - y;
        return c1 * c1 + c2 * c2 <= this.raio * this.raio;
    }

}



function preparar() {

    const canvas = document.getElementById( "canvas" );
    ctx = canvas.getContext( "2d" );

    largura = canvas.width;
    altura = canvas.height;

    bolinhas.push( new Bolinha( largura / 2, altura / 2, 25, 200, 200, "#000000" ) );

    canvas.addEventListener( "contextmenu", event => {
        event.preventDefault();
    });

    canvas.addEventListener( "mousedown", event => {
        
        event.preventDefault();

        if ( event.button === 0 ) {
            for ( let i = bolinhas.length - 1; i >= 0; i-- ) {
                const bolinha = bolinhas[i];
                if ( bolinha.intersepta( event.offsetX, event.offsetY ) ) {
                    bolinha.emArraste = true;
                    bolinha.diffX = event.offsetX - bolinha.x;
                    bolinha.diffY = event.offsetY - bolinha.y;
                    bolinhaSelecionada = bolinha;
                    break;
                }
            }
        } else if ( event.button === 1 ) {
            for ( let i = 0; i < bolinhas.length; i++ ) {
                const bolinha = bolinhas[i];
                bolinha.vx = gerarVelocidadeAleatoria( 400, 1000 );
                bolinha.vy = gerarVelocidadeAleatoria( 400, 1000 );
            }
        } else if ( event.button === 2 ) {
            criarBolinha( event.offsetX, event.offsetY );
            mouseDown = true;
        }

    });

    canvas.addEventListener( "mouseup", event => {
        if ( event.button === 0 ) {
            if ( bolinhaSelecionada != null ) {
                bolinhaSelecionada.emArraste = false;
            }
        } else if ( event.button === 2 ) {
            mouseDown = false;
        }
    });

    canvas.addEventListener( "mousemove", event => {
        mouseX = event.offsetX;
        mouseY = event.offsetY;
        if ( mouseDown ) {
            criarBolinha( event.offsetX, event.offsetY );
        }
    });

    canvas.addEventListener( "mouseout", event => {
        if ( bolinhaSelecionada != null ) {
            bolinhaSelecionada.emArraste = false;
        }
    });

    requestAnimationFrame( executar );

}


function executar( tempoAtual ) {

    // tempo em milisegundos!
    delta = ( tempoAtual - ultimoTempo ) / 1000.0;
    ultimoTempo = tempoAtual;

    atualizar( delta );
    desenhar( ctx );

    requestAnimationFrame( executar );
    
}

function atualizar( delta ) {
    for ( let i = 0; i < bolinhas.length; i++ ) {
        bolinhas[i].atualizar( largura, altura, delta );
    }
}

function desenhar( ctx ) {

    ctx.clearRect( 0, 0, largura, altura );
    ctx.fillStyle = "#000000";
    ctx.font = "12px monospace";
    ctx.fillText( `FPS: ${Math.round( 1.0 / delta )}`, 10, 22 );
    ctx.fillText( `Bolinhas: ${bolinhas.length}`, 10, 36 );

    for ( let i = 0; i < bolinhas.length; i++ ) {
        bolinhas[i].desenhar( ctx );
    }

}

function criarBolinha( x, y ) {

    const r = Math.random() * 256;
    const g = Math.random() * 256;
    const b = Math.random() * 256;

    bolinhas.push( 
        new Bolinha(
            x,
            y,
            6 + Math.random() * 15,
            gerarVelocidadeAleatoria( 50, 400 ),
            gerarVelocidadeAleatoria( 50, 400 ),
            `rgb(${r},${g},${b})`
        )
    );
}

function gerarVelocidadeAleatoria( minima, maxima ) {
    return ( minima + Math.random() * ( maxima - minima ) ) * ( Math.random() < 0.5 ? -1 : 1 )
}

preparar();
