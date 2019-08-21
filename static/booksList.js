var booksList = angular.module('booksList', ['ngSanitize']);

booksList.service('booksService', function($http, $location) {
    let server = $location.protocol() + '://' + $location.host() + ':' + $location.port() + '/books';
    this.getBooks = function(offset, limit) {
        var promise = $http.get(server + '?offset=' + offset + '&limit=' + limit);
        return promise.then(function(response) {
            return response.data;
        });
    };
});

booksList.controller('booksController', function($scope, booksService) {
    $scope.currentPage = 1;
    $scope.limit = 5;

    function getBooksForCurrentPage() {
        let offset = 0;
        if ($scope.currentPage != 1) {
            // eslint-disable-next-line prettier/prettier
          offset = ($scope.currentPage - 1) + $scope.limit;
        }
        booksService.getBooks(offset, $scope.limit).then(function(data) {
            $scope.totalPages = data.totalBooks / $scope.limit;
            $scope.books = data.booksList;
        });
    }

    $scope.nextPage = function() {
        $scope.currentPage += 1;
        getBooksForCurrentPage();
    };

    $scope.previousPage = function() {
        $scope.currentPage -= 1;
        getBooksForCurrentPage();
    };

    getBooksForCurrentPage();
});
