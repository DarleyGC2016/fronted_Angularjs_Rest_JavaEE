angular
  .module("hackaton-stefanini")
  .controller("PessoaIncluirAlterarController", PessoaIncluirAlterarController);
PessoaIncluirAlterarController.$inject = [
  "$rootScope",
  "$scope",
  "$location",
  "$q",
  "$filter",
  "$routeParams",
  "HackatonStefaniniService"
];

function PessoaIncluirAlterarController(
  $rootScope,
  $scope,
  $location,
  $q,
  $filter,
  $routeParams,
  HackatonStefaniniService
) {
  /**ATRIBUTOS DA TELA */
  vm = this;

  vm.pessoa = {
    id: null,
    nome: "",
    email: "",
    dataNascimento: null,
    enderecos: [],
    perfils: [],
    situacao: false
  };
  vm.enderecoDefault = {
    id: null,
    idPessoa: null,
    cep: "",
    uf: "",
    localidade: "",
    bairro: "",
    logradouro: "",
    complemento: ""
  };

  vm.urlEndereco = "http://localhost:8080/treinamento/api/enderecos/";
  vm.urlPerfil = "http://localhost:8080/treinamento/api/perfils/";
  vm.urlPessoa = "http://localhost:8080/treinamento/api/pessoas/";

  vm.idPessoaDefault = null;
  vm.uf = null;
  /**METODOS DE INICIALIZACAO */
  vm.init = function() {
    vm.tituloTelaEndereco = "Cadastrar Endereço";
    vm.tituloTela = "Cadastrar Pessoa";
    vm.acao = "Cadastrar";
    vm.acaoEnd = "Cadastrar";
    /**Recuperar a lista de perfil */
    vm.listar(vm.urlPerfil).then(function(response) {
      if (response !== undefined) {
        vm.listaPerfil = response;
        if ($routeParams.idPessoa) {
          vm.tituloTela = "Editar Pessoa";
          vm.acao = "Editar";

          vm.recuperarObjetoPorIDURL($routeParams.idPessoa, vm.urlPessoa).then(
            function(pessoaRetorno) {
              if (pessoaRetorno !== undefined) {
                vm.pessoa = pessoaRetorno;
                /*vm.pessoa.dataNascimento = vm.formataDataTela(
                  pessoaRetorno.dataNascimento
                );*/
                vm.perfil = vm.pessoa.perfils[0];
              }
            }
          );
        }
      }
    });
  };

  /**METODOS DE TELA */
  vm.cancelar = function() {
    vm.retornarTelaListagem();
  };

  vm.retornarTelaListagem = function() {
    $location.path("listarPessoas");
  };

  vm.abrirModal = function(endereco) {
    vm.enderecoModal = vm.enderecoDefault;

    if (endereco !== undefined) {
      vm.acaoEnd = "Editar";
      vm.tituloTelaEndereco = "Editar Endereço";
      vm.enderecoModal = endereco;
    }

    if (vm.pessoa.enderecos.length === 0)
      vm.pessoa.enderecos.push(vm.enderecoModal);

    $("#modalEndereco").modal();
  };

  vm.limparTela = function() {
    $("#modalEndereco").modal("toggle");
    vm.endereco = undefined;
  };
  vm.incluirEndereco = function() {
    if (vm.pessoa.id == undefined) {
      alert("Não pode cadastrar Endereço sem Pessoa já cadastrada!");
      vm.retornarTelaListagem();
    } else {
      vm.enderecoModal.uf = vm.uf.desc;
      vm.enderecoModal.idPessoa = vm.pessoa.id;
      var endereco = angular.copy(vm.enderecoModal);
      if (vm.acaoEnd == "Cadastrar") {
        vm.salvar(vm.urlEndereco, endereco).then(function(enderecoRetorno) {
          vm.retornarTelaListagem();
        });
      } else if (vm.acaoEnd == "Editar") {
        vm.alterar(vm.urlEndereco, endereco).then(function(enderecoRetorno) {
          vm.retornarTelaListagem();
        });
      }
    }
  };
  vm.incluir = function() {
    var objetoDados = angular.copy(vm.pessoa);

    var listaEndereco = [];

    angular.forEach(objetoDados.enderecos, function(value, key) {
      if (value.complemento.length > 0) {
        value.idPessoa = objetoDados.id;
        listaEndereco.push(angular.copy(value));
      }
    });

    objetoDados.enderecos = listaEndereco;
    if (vm.perfil !== null) {
      var isNovoPerfil = true;

      angular.forEach(objetoDados.perfils, function(value, key) {
        if (value.id === vm.perfil.id) {
          isNovoPerfil = false;
        }
      });
      if (isNovoPerfil) objetoDados.perfils.push(vm.perfil);
    }
    if (vm.acao == "Cadastrar") {
      console.log(vm.pessoa.dataNascimento);
      objetoDados.dataNascimento = vm.formataDataJava(vm.pessoa.dataNascimento);
      vm.salvar(vm.urlPessoa, objetoDados).then(function(pessoaRetorno) {
        vm.retornarTelaListagem();
      });
    } else if (vm.acao == "Editar") {
      vm.alterar(vm.urlPessoa, objetoDados).then(function(pessoaRetorno) {
        vm.retornarTelaListagem();
      });
    }
  };

  vm.remover = function(objeto, tipo) {
    var url = vm.urlPessoa + objeto.id;
    if (tipo === "ENDERECO") url = vm.urlEndereco + objeto.id;

    vm.excluir(url).then(function(ojetoRetorno) {
      vm.retornarTelaListagem();
    });
  };

  vm.editar = function(objeto, tipo) {
    var url = vm.urlPessoa + objeto.id;
    if (tipo === "ENDERECO") url = vm.urlEndereco + objeto.id;

    vm.alterar(url).then(function(ojetoRetorno) {
      vm.retornarTelaListagem();
    });
  };

  /**METODOS DE SERVICO */
  vm.recuperarObjetoPorIDURL = function(id, url) {
    var deferred = $q.defer();
    HackatonStefaniniService.listarId(url + id).then(function(response) {
      if (response.data !== undefined) deferred.resolve(response.data);
      else deferred.resolve(vm.enderecoDefault);
    });
    return deferred.promise;
  };

  vm.listar = function(url) {
    var deferred = $q.defer();
    HackatonStefaniniService.listar(url).then(function(response) {
      if (response.data !== undefined) {
        deferred.resolve(response.data);
      }
    });
    return deferred.promise;
  };

  vm.salvar = function(url, objeto) {
    var deferred = $q.defer();
    var obj = JSON.stringify(objeto);
    HackatonStefaniniService.incluir(url, obj).then(function(response) {
      if (response.status == 200) {
        deferred.resolve(response.data);
      }
    });
    return deferred.promise;
  };

  vm.alterar = function(url, objeto) {
    var deferred = $q.defer();
    var obj = JSON.stringify(objeto);
    HackatonStefaniniService.alterar(url, obj).then(function(response) {
      if (response.status == 200) {
        deferred.resolve(response.data);
      }
    });
    return deferred.promise;
  };

  vm.excluir = function(url, objeto) {
    var deferred = $q.defer();
    HackatonStefaniniService.excluir(url).then(function(response) {
      if (response.status == 200) {
        deferred.resolve(response.data);
      }
    });
    return deferred.promise;
  };

  /**METODOS AUXILIARES */
  vm.formataDataJava = function(data) {
    var dia = data.slice(0, 2);
    var mes = data.slice(2, 4);
    var ano = data.slice(4, 8);

    return dia + "/" + mes + "/" + ano;
  };

  vm.formataDataTela = function(data) {
    var ano = data.slice(0, 4);
    var mes = data.slice(5, 7);
    var dia = data.slice(8, 10);

    return dia + mes + ano;
  };

  vm.listaUF = [
    { id: 1, desc: "RO" },
    { id: 2, desc: "AC" },
    { id: 3, desc: "AM" },
    { id: 4, desc: "RR" },
    { id: 5, desc: "PA" },
    { id: 6, desc: "AP" },
    { id: 7, desc: "TO" },
    { id: 8, desc: "MA" },
    { id: 9, desc: "PI" },
    { id: 10, desc: "CE" },
    { id: 11, desc: "RN" },
    { id: 12, desc: "PB" },
    { id: 13, desc: "PE" },
    { id: 14, desc: "AL" },
    { id: 15, desc: "SE" },
    { id: 16, desc: "BA" },
    { id: 17, desc: "MG" },
    { id: 18, desc: "ES" },
    { id: 19, desc: "RJ" },
    { id: 20, desc: "SP" },
    { id: 21, desc: "PR" },
    { id: 22, desc: "SC" },
    { id: 23, desc: "RS" },
    { id: 24, desc: "MS" },
    { id: 25, desc: "MT" },
    { id: 26, desc: "GO" },
    { id: 27, desc: "DF" }
  ];
}
