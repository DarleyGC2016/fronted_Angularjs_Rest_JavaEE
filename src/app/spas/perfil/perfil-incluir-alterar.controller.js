angular
  .module("hackaton-stefanini")
  .controller("PerfilIncluirAlterarController", PerfilIncluirAlterarController);
PerfilIncluirAlterarController.$inject = [
  "$rootScope",
  "$scope",
  "$location",
  "$q",
  "$filter",
  "$routeParams",
  "HackatonStefaniniService"
];

function PerfilIncluirAlterarController(
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

  vm.perfil = {
    id: null,
    nome: "",
    descricao: ""
  };

  vm.urlPerfil = "http://localhost:8080/treinamento/api/perfils/";

  /**METODOS DE INICIALIZACAO */
  vm.init = function() {
    vm.tituloTela = "Cadastrar Perfil";
    vm.acao = "Cadastrar";

    if ($routeParams.idPerfil) {
      vm.tituloTela = "Editar Perfil";
      vm.acao = "Editar";

      vm.recuperarObjetoPorIDURL($routeParams.idPerfil, vm.urlPerfil).then(
        function(perfilRetorno) {
          if (perfilRetorno !== undefined) {
            vm.perfil = perfilRetorno;
          }
        }
      );
    }
  };

  /**METODOS DE TELA */
  vm.cancelar = function() {
    vm.retornarTelaListagem();
  };

  vm.retornarTelaListagem = function() {
    $location.path("listarPerfis");
  };

  vm.incluir = function() {
    var obj = angular.copy(vm.perfil);

    if (vm.acao == "Cadastrar") {
      vm.salvar(vm.urlPerfil, obj).then(function(perfilRetorno) {
        vm.retornarTelaListagem();
      });
    } else if (vm.acao == "Editar") {
      vm.alterar(vm.urlPerfil, obj).then(function(perfilRetorno) {
        vm.retornarTelaListagem();
      });
    }
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
}
