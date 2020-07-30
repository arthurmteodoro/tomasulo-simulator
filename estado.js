export default class Estado {
    constructor(CONFIG, instrucoes) {
        this.configuracao = {
            "numInstrucoes": CONFIG["nInst"],
            "ciclos": CONFIG["ciclos"],
            "unidades": CONFIG["unidades"]
        };

        this.estadoInstrucoes = [];

        for(let i = 0; i < this.configuracao["numInstrucoes"]; i++) {
            let linha = {}
            linha["instrucao"] = {
                "operacao": instrucoes[i]["d"],
                "registradorR": instrucoes[i]["r"],
                "registradorS": instrucoes[i]["s"],
                "registradorT": instrucoes[i]["t"],
            };

            linha["posicao"] = i;
            linha["issue"] = null;
            linha["exeCompleta"] = null;
            linha["write"] = null;
            this.estadoInstrucoes[i] = linha;
        
        }
        
        this.unidadesFuncionais = {};

        for (var tipoUnidade in CONFIG["unidades"]) {
            for (let i = 0; i < CONFIG["unidades"][tipoUnidade]; i++) {
                let unidadeFuncional = {};
                unidadeFuncional["instrucao"] = null;
                unidadeFuncional["tipoUnidade"] = tipoUnidade;
                unidadeFuncional["tempo"] = null;

                let nome = tipoUnidade + (i+1);
                unidadeFuncional["nome"] = nome;
                unidadeFuncional["ocupado"] = false;

                unidadeFuncional["operacao"] = null;
                unidadeFuncional["vj"] = null;
                unidadeFuncional["vk"] = null;
                unidadeFuncional["qj"] = null;
                unidadeFuncional["qk"] = null;

                this.unidadesFuncionais[nome] = unidadeFuncional;
            }
            
        }

        this.unidadesFuncionaisMemoria = {}
        for(var tipoUnidade in CONFIG["unidadesMem"]) {
            for(let i = 0; i < CONFIG["unidadesMem"][tipoUnidade]; i++) {
                let unidadeFuncionalMemoria = {};
                unidadeFuncionalMemoria["instrucao"] = null;
                unidadeFuncionalMemoria["tipo"] = tipoUnidade;
                unidadeFuncionalMemoria["tempo"] = null;

                let nome = tipoUnidade + (i+1);
                unidadeFuncionalMemoria["nome"] = nome;
                unidadeFuncionalMemoria["ocupado"] = false;
                
                unidadeFuncionalMemoria["operacao"] = null;
                unidadeFuncionalMemoria["endereco"] = null;
                unidadeFuncionalMemoria["destino"] = null;
                
                this.unidadesFuncionaisMemoria[nome] = unidadeFuncionalMemoria;
            }
        }

        this.clock = 0;

        this.estacaoRegistradores = {}
        for(let i = 0; i < 32; i += 2) {
            this.estacaoRegistradores["F" + i] = null;
        }
    }

}