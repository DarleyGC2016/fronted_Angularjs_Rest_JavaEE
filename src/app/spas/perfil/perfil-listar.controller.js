angular
  .module("hackaton-stefanini")
  .controller("PerfilListarController", PerfilListarController);
PerfilListarController.$inject = [
  "$rootScope",
  "$scope",
  "$location",
  "$q",
  "$filter",
  "$routeParams",
  "HackatonStefaniniService"
];

function PerfilListarController(
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

  vm.url = "http://localhost:8080/treinamento/api/perfils/";
  vm.urlPessoa = "http://localhost:8080/treinamento/api/pessoas/";

  vm.init = function() {
    HackatonStefaniniService.listar(vm.url).then(function(responsePerfils) {
      if (responsePerfils.data !== undefined)
        vm.listaPerfis = responsePerfils.data;
      console.log(vm.listaPerfis);
      vm.listaPerfisMostrar = [];
      var max =
        vm.listaPerfis.length > vm.qdePorPagina
          ? vm.qdePorPagina
          : vm.listaPerfis.length;

      vm.qdePaginacao = new Array(
        vm.listaPerfis.length % vm.qdePorPagina === 0
          ? vm.listaPerfis.length / vm.qdePorPagina
          : parseInt(vm.listaPerfis.length / vm.qdePorPagina) + 1
      );
      vm.currentPage = 1;
      for (var count = 0; count < max; count++) {
        vm.listaPerfisMostrar.push(vm.listaPerfis[count]);
        vm.ultimoIndex++;
      }

      vm.listaPerfisMostrar.sort(function(a, b) {
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
    vm.listaPerfisMostrar = [];
    vm.currentPage++;

    var idx = angular.copy(vm.ultimoIndex);
    var cont = vm.listaPerfis.length - vm.qdePorPagina;
    for (
      var count = cont > vm.qdePorPagina ? vm.qdePorPagina : cont;
      count > 0;
      count--
    ) {
      vm.listaPerfisMostrar.push(vm.listaPerfis[idx++]);
      vm.ultimoIndex++;
      vm.contador++;
    }
    vm.listaPerfisMostrar.sort(function(a, b) {
      return a.id - b.id;
    });
  };

  vm.retrocederPaginanacao = function(index) {
    vm.listaPerfisMostrar = [];

    vm.currentPage--;
    var idx = vm.contador - 1;
    vm.ultimoIndex = idx + 1;
    for (var count = vm.qdePorPagina; count > 0; count--) {
      vm.listaPerfisMostrar.push(vm.listaPerfis[idx--]);
      vm.contador--;
    }
    vm.listaPerfisMostrar.sort(function(a, b) {
      return a.id - b.id;
    });
  };

  vm.editar = function(id) {
    if (id !== undefined) $location.path("EditarPerfis/" + id);
    else $location.path("cadastrarPerfil");
  };

  vm.remover = function(id) {
    var liberaExclusao = true;

    angular.forEach(vm.listaPessoa, function(value, key) {
      if (value.id === id) {
        liberaExclusao = false;
      }
    });

    if (liberaExclusao) {
      HackatonStefaniniService.excluir(vm.url + id).then(function(response) {
        vm.init();
      });
      console.log(liberaExclusao);
    } else {
      alert("Perfil com Pessoa vinculada, exclusão não permitida!");
    }
  };

  vm.retornarTelaListagem = function() {
    $location.path("listarPerfis");
  };

  vm.mask = function mascara(t, mask) {
    var i = t.value.length;
    var saida = mask.substring(1, 0);
    var texto = mask.substring(i);
    if (texto.substring(0, 1) != saida) {
      t.value += texto.substring(0, 1);
    }
  };
}
