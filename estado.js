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
                unidadeFuncional["estadoInstrucao"] = null;
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
                unidadeFuncionalMemoria["estadoInstrucao"] = null;
                unidadeFuncionalMemoria["tipoUnidade"] = tipoUnidade;
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

    getNovaInstrucao() {
        for (let i = 0; i < this.estadoInstrucoes.length; i++) {
            const element = this.estadoInstrucoes[i];
            if(element.issue == null)
                return element;
        }
        return undefined;
    }

    verificaUFInstrucao(instrucao) {
        switch (instrucao.operacao) {
            case 'ADDD':
                return 'Add'
            case 'SUBD':
                return 'Add'
            case 'MULTD':
                return 'Mult'
            case 'DIVD':
                return 'Mult'
            case 'LD':
                return 'Load'
            case 'SD':
                return 'Store'
            case 'ADD':
                return 'Integer'
            case 'DADDUI':
                return 'Integer'
            case 'BEQ':
                return 'Integer'
            case 'BNEZ':
                return 'Integer'
        }
    }

    getFUVazia(tipoFU) {
        if ((tipoFU === 'Load') || (tipoFU === 'Store')) {
            for(let key in this.unidadesFuncionaisMemoria) {
                var ufMem = this.unidadesFuncionaisMemoria[key];

                if (ufMem.tipoUnidade === tipoFU) {
                    if (!ufMem.ocupado) {
                        return ufMem;
                    }
                }
            }
            return undefined;
        }
        for(let key in this.unidadesFuncionais) {
            var uf = this.unidadesFuncionais[key];

            if (uf.tipoUnidade === tipoFU) {
                if (!uf.ocupado) {
                    return uf;
                }
            }
        }
        return undefined;
    }

    getCiclos(instrucao) {
        switch (instrucao.operacao) {
            case 'ADDD':
                return parseInt(this.configuracao.ciclos['Add']);
            case 'SUBD':
                return parseInt(this.configuracao.ciclos['Add']);
            case 'MULTD':
                return parseInt(this.configuracao.ciclos['Mult']);
            case 'DIVD':
                return parseInt(this.configuracao.ciclos['Div']);
            case 'LD':
                return parseInt(this.configuracao.ciclos['Load']);
            case 'SD':
                return parseInt(this.configuracao.ciclos['Store']);
            case 'ADD':
                return parseInt(this.configuracao.ciclos['Integer']);
            case 'DADDUI':
                return parseInt(this.configuracao.ciclos['Integer']);
            case 'BEQ':
                return parseInt(this.configuracao.ciclos['Integer']);
            case 'BNEZ':
                return parseInt(this.configuracao.ciclos['Integer']);
        }
    }

    alocaFuMem(uf, instrucao, estadoInstrucao) {
        uf.instrucao = instrucao;
        uf.estadoInstrucao = estadoInstrucao;
        uf.tempo = this.getCiclos(instrucao) + 1;
        uf.ocupado = true;
        uf.operacao = 'Load';
        uf.operacao = instrucao.operacao;
        uf.endereco = instrucao.registradorS + '+' + instrucao.registradorT;
        uf.destino = instrucao.registradorR;
    }

    escreveEstacaoRegistrador(instrucao, ufNome) {
        this.estacaoRegistradores[instrucao.registradorR] = ufNome;
    }

    alocaFU(uf, instrucao, estadoInstrucao) {
        uf.instrucao = instrucao;
        uf.estadoInstrucao = estadoInstrucao;
        uf.tempo = this.getCiclos(instrucao) + 1; // é somado 1 pq vai ser subtraido 1 na fase de execucao apos isso 
        uf.ocupado = true;
        uf.operacao = instrucao.operacao;

        let reg_j = this.estacaoRegistradores[instrucao.registradorS];
        let reg_k = this.estacaoRegistradores[instrucao.registradorT];

        if (reg_j === null || reg_j === undefined)
            uf.vj = instrucao.registradorS;
        else {
            if ((reg_j in this.unidadesFuncionais) || (reg_j in this.unidadesFuncionaisMemoria))
                uf.qj = reg_j;
            else
                uf.vj = reg_j;
        }

        if (reg_k === null || reg_j === undefined)
            uf.vk = instrucao.registradorT;
        else {
            if ((reg_k in this.unidadesFuncionais) || (reg_k in this.unidadesFuncionaisMemoria))
                uf.qk = reg_k;
            else
                uf.vk = reg_k;
        }
    }

    issueNovaInstrucao() {
        let novaInstrucao = this.getNovaInstrucao();
        console.log(novaInstrucao);

        if (novaInstrucao) {
            let ufInstrucao = this.verificaUFInstrucao(novaInstrucao.instrucao);
            let UFParaUsar = this.getFUVazia(ufInstrucao);
            
            if (UFParaUsar) {
                if ((UFParaUsar.tipoUnidade == 'Load') || (UFParaUsar.tipoUnidade == 'Store'))
                    this.alocaFuMem(UFParaUsar, novaInstrucao.instrucao, novaInstrucao);
                else
                    this.alocaFU(UFParaUsar, novaInstrucao.instrucao, novaInstrucao);
                novaInstrucao.issue = this.clock;
                this.escreveEstacaoRegistrador(novaInstrucao.instrucao, UFParaUsar.nome);
            }
        }
    }

    executaInstrucao() {
        for(let key in this.unidadesFuncionaisMemoria) {
            var ufMem = this.unidadesFuncionaisMemoria[key];

            if (ufMem.ocupado === true) {
                ufMem.tempo = ufMem.tempo - 1;

                if (ufMem.tempo === 0) {
                    ufMem.estadoInstrucao.exeCompleta = this.clock;
                }
            }
        }

        for(let key in this.unidadesFuncionais) {
            var uf = this.unidadesFuncionais[key];

            if ((uf.ocupado === true) && (uf.vj !== null) && (uf.vk !== null)) {
                uf.tempo = uf.tempo - 1;

                if (uf.tempo === 0) {
                    uf.estadoInstrucao.exeCompleta = this.clock;
                }
            }
        }
    }


    liberaUFEsperandoResultado(UF) {
        for(let keyUF in this.unidadesFuncionais) {
            const ufOlhando = this.unidadesFuncionais[keyUF];
            
            console.log(ufOlhando);
            if ((ufOlhando.ocupado === true) && 
               ((ufOlhando.qj === UF.nome) || 
               (ufOlhando.qk === UF.nome))) {
                if (ufOlhando.qj === UF.nome) {
                    ufOlhando.vj = 'VAL(' + UF.nome + ')';
                    ufOlhando.qj = null;
                }
                if (ufOlhando.qk === UF.nome) {
                    ufOlhando.vk = 'VAL(' + UF.nome + ')';
                    ufOlhando.qk = null;
                }

                if ((ufOlhando.qj === null) && (ufOlhando.qk === null)) {
                    ufOlhando.tempo = ufOlhando.tempo - 1; // subtrai 1 pq tira aquele valor q tava sobrando quando foi colocado
                }
            }
        }
    }

    desalocaUFMem(ufMem) {
        ufMem.instrucao = null;
        ufMem.estadoInstrucao = null;
        ufMem.tempo = null;
        ufMem.ocupado = false;
        ufMem.operacao = null;
        ufMem.endereco = null;
        ufMem.destino = null;
    }

    desalocaUF(uf) {
        uf.instrucao = null;
        uf.estadoInstrucao = null;
        uf.tempo = null;
        uf.ocupado = false;
        uf.operacao = null;
        uf.vj = null;
        uf.vk = null;
        uf.qj = null;
        uf.qk = null;
    }

    escreveInstrucao() {
        for(let key in this.unidadesFuncionaisMemoria) {
            const ufMem = this.unidadesFuncionaisMemoria[key];

            if (ufMem.ocupado === true) {
                if (ufMem.tempo === -1) {
                    ufMem.estadoInstrucao.write = this.clock;

                    let valorReg = this.estacaoRegistradores[ufMem.instrucao.registradorR];
                    if (valorReg === ufMem.nome) {
                        this.estacaoRegistradores[ufMem.instrucao.registradorR] = 'VAL(' + ufMem.nome + ')';
                    }

                    this.liberaUFEsperandoResultado(ufMem);
                    this.desalocaUFMem(ufMem);
                }
            }
        }

        for(let key in this.unidadesFuncionais) {
            const uf = this.unidadesFuncionais[key];

            if (uf.ocupado === true) {
                if (uf.tempo === -1) {
                    uf.estadoInstrucao.write = this.clock;

                    let valorReg = this.estacaoRegistradores[uf.instrucao.registradorR];
                    if (valorReg === uf.nome) {
                        this.estacaoRegistradores[uf.instrucao.registradorR] = 'VAL(' + uf.nome + ')';
                    }

                    this.liberaUFEsperandoResultado(uf);
                    this.desalocaUF(uf);
                }
            }
        }
    }

    verificaSeJaTerminou() {
        let qtdInstrucaoNaoTerminada = 0;
        for (let i = 0; i < this.estadoInstrucoes.length; i++) {
            const element = this.estadoInstrucoes[i];
            
            if (element.write === null)
                qtdInstrucaoNaoTerminada++;
        }

        return qtdInstrucaoNaoTerminada > 0 ? false : true;
    }
    

    executa_ciclo() {
        this.clock++;

        this.issueNovaInstrucao();
        this.executaInstrucao();
        this.escreveInstrucao();

        console.log('Estado instrução:');
        console.log(JSON.stringify(this.estadoInstrucoes, null, 2));

        console.log('\nUnidades Funcionais memória:');
        console.log(JSON.stringify(this.unidadesFuncionaisMemoria, null, 2));

        console.log('\nUnidades Funcionais:');
        console.log(JSON.stringify(this.unidadesFuncionais, null, 2));

        console.log('Estado registradores:');
        console.log(JSON.stringify(this.estacaoRegistradores, null, 2));

        return this.verificaSeJaTerminou();
    }



}