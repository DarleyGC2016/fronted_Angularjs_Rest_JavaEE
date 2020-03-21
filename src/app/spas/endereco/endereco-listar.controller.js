angular
  .module("hackaton-stefanini")
  .controller("EnderecoListarController", EnderecoListarController);
EnderecoListarController.$inject = [
  "$rootScope",
  "$scope",
  "$location",
  "$q",
  "$filter",
  "$routeParams",
  "HackatonStefaniniService"
];

function EnderecoListarController(
  $rootScope,
  $scope,
  $location,
  $q,
  $filter,
  $routeParams,
  HackatonStefaniniService
) {
  vm = this;

  vm.qdePorPagina = 3;
  vm.ultimoIndex = 0;
  vm.contador = 0;

  vm.url = "http://localhost:8080/treinamento/api/enderecos/";
  vm.urlPessoa = "http://localhost:8080/treinamento/api/pessoas/";

  vm.init = function() {
    HackatonStefaniniService.listar(vm.url).then(function(responseEnderecos) {
      if (responseEnderecos.data !== undefined)
        vm.listaEnderecos = responseEnderecos.data;
      vm.listaEnderecosMostrar = [];
      var max =
        vm.listaEnderecos.length > vm.qdePorPagina
          ? vm.qdePorPagina
          : vm.listaEnderecos.length;

      vm.qdePaginacao = new Array(
        vm.listaEnderecos.length % vm.qdePorPagina === 0
          ? vm.listaEnderecos.length / vm.qdePorPagina
          : parseInt(vm.listaEnderecos.length / vm.qdePorPagina) + 1
      );
      vm.currentPage = 1;
      for (var count = 0; count < max; count++) {
        vm.listaEnderecosMostrar.push(vm.listaEnderecos[count]);
        vm.ultimoIndex++;
      }

      vm.listaEnderecosMostrar.sort(function(a, b) {
        return a.id - b.id;
      });

      HackatonStefaniniService.listar(vm.urlPessoa).then(function(
        responsePessoa
      ) {
        if (responsePessoa.data !== undefined)
          vm.listaPessoa = responsePessoa.data;
      });
    });
  };

  vm.atualizarPaginanacao = function(index) {
    if (index >= vm.currentPage) vm.avancarPaginanacao(index);
    else vm.retrocederPaginanacao(index);
  };

  vm.avancarPaginanacao = function(index) {
    vm.listaEnderecosMostrar = [];
    vm.currentPage++;

    var idx = angular.copy(vm.ultimoIndex);
    var cont = vm.listaEnderecos.length - vm.qdePorPagina;
    for (
      var count = cont > vm.qdePorPagina ? vm.qdePorPagina : cont;
      count > 0;
      count--
    ) {
      vm.listaEnderecosMostrar.push(vm.listaEnderecos[idx++]);
      vm.ultimoIndex++;
      vm.contador++;
    }
    vm.listaEnderecosMostrar.sort(function(a, b) {
      return a.id - b.id;
    });
  };

  vm.retrocederPaginanacao = function(index) {
    vm.listaEnderecosMostrar = [];

    vm.currentPage--;
    var idx = vm.contador - 1;
    vm.ultimoIndex = idx + 1;
    for (var count = vm.qdePorPagina; count > 0; count--) {
      vm.listaEnderecosMostrar.push(vm.listaEnderecos[idx--]);
      vm.contador--;
    }
    vm.listaEnderecosMostrar.sort(function(a, b) {
      return a.id - b.id;
    });
  };

  vm.retornarTelaListagem = function() {
    $location.path("listarEnderecos");
  };
}
