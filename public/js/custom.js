
window.user_data = window.user_data || {
    is_logged: false,
    user: false,
};

window.timer = false;

const app_host = window.app_host;

var html = `
<div class="col-sm-2">
<div class="card">
  <h5 class="card-header align-items-center d-flex justify-content-center text-center title"></h5>
  <div class="image-container"></div>
  <ul class="list-group list-group-flush details">
    <li class="list-group-item director">Reżyser: </li>
    <li class="list-group-item length">Długość: </li>
    <li class="list-group-item genre">Gatunek: </li>
  </ul>
</div></div>`;

$(document).ready(function(){


    /////////////////////
    // funckje pomocnicze

    // szukaj elementow w tablicy po danym kluczu i wartosci
    function getElementsByKeyAndIdFromCollection(collection, key_name, id) {
        var results = [];

        for (var index in collection) {
            var item = collection[index];

            if (item[key_name] === id) {
                results.push(item);
            }
        }

        return results;
    }

    // szukaj jednego elementu w tablicy po wartosci klucza id
    function getElementByIdFromCollection(collection, id) {
        for (var index in collection) {
            var item = collection[index];

            if (item.id === id) {
                return item;
            }
        }

        console.log('item not found in collection');
        return false;
    }

    /////////////////////




    $('.link-home').on('click', function () {
        $('.link-home, .link-repertuar, .link-about').removeClass('active');
        $(this).addClass('active');


        $('.main-page-container').removeClass('hide');
        $('.repertuar-container, .about-container').addClass('hide');
        return false;
    });

    $('.link-repertuar').on('click', function () {
        $('.link-home, .link-repertuar, .link-about').removeClass('active');
        $(this).addClass('active');

        $('.repertuar-container').removeClass('hide');
        $('.main-page-container, .about-container').addClass('hide');
        return false;
    });

    $('.link-about').on('click', function () {
        $('.link-home, .link-repertuar, .link-about').removeClass('active');
        $(this).addClass('active');

        $('.about-container').removeClass('hide');
        $('.main-page-container, .repertuar-container').addClass('hide');
        return false;
    });



    function processLoggedUser(data) {
        window.user_data.is_logged = true;
        window.user_data.user = data.user;

        $('.login_form_container').addClass('hide');
        $('.logged_user_container').removeClass('hide');
        $('.logged_user_container .username').html(data.user.email);

    }

    function processLoggedOutUser(data) {
        window.user_data.is_logged = false;
        window.user_data.user = false;

        $('.login_form_container').removeClass('hide');
        $('.logged_user_container').addClass('hide');
        $('.logged_user_container .username').html('');
    }

    function getUserData() {
        $.ajax({
            type: 'POST',
            url: 'http://' + app_host + '/api/logged_user',
            dataType: 'json',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            success: function (data) {
                //console.log(data);
                if (data.status === 'ok') {
                    processLoggedUser(data);
                } else {
                    processLoggedOutUser(data);
                }
            }
        });
    }

    getUserData();


    $('.logout-button').on('click', function () {
        $.ajax({
            type: 'POST',
            url: 'http://' + app_host + '/api/logout',
            dataType: 'json',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            success: function (data) {
                console.log(data);
                if (data.status === 'ok') {
                    processLoggedOutUser(data);
                }
            }
        });
    });


    $('form#formLogin').on('submit', function (e) {
        e.stopPropagation();

        var email = $('#formLogin input.email').val();
        var password = $('#formLogin input.password').val();

        if (false === /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-\\.]+(?:\\.[a-zA-Z0-9-]+)*$/.test(email)) {
            $('.login_form_message').html('Nieprawidłowy adres email!');
            return false;
        }

        if (false === /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password)) {
            $('.login_form_message').html('Hasło zbyt proste!');
            return false;
        }

        $.ajax({
            type: 'POST',
            url: 'http://' + app_host + '/api/login',
            data: {
                email: email,
                password: password
            },
            dataType: 'json',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            success: function (data) {
                //console.log(data);

                if (data.status === 'ok') {
                    processLoggedUser(data);
                    //close modal
                    $('#formLogin .btn-outline-secondary').trigger('click');
                    $('.login_form_message').html('');
                } else {
                    processLoggedOutUser(data);
                    $('.login_form_message').html(data.message);
                }
            }
        });

        return false;
    });



    $.ajax({
        type: 'GET',
        url: 'http://' + app_host + '/filmy.json',
        dataType: 'json',
        success: function (data) {

            window.movies = data;

            for(var i=0;i<data.length;i++){
                $('#printcard').append(html);

                var container = $('#printcard .card:eq('+i+')');
                var uimg = data[i].image;

                var img = $("<img/>");
                img.attr("src", uimg);
                img.attr("class", "img-fluid");

                $(container).find('.image-container').append($(img).clone());
                $(container).find('.title').html(data[i].title);
                $(container).find('.director').append(data[i].director);
                $(container).find('.length').append(data[i].runtime);
                $(container).find('.genre').append(data[i].genre);
            }
        }
    });


    $('#datepicker_1').datepicker({
        format: "yyyy-mm-dd",
        language: "pl",
        autoclose: true,
        todayBtn: "linked",
        todayHighlight: true
    });


    $.ajax({
        type: 'GET',
        url: 'http://' + app_host + '/informacje.json',
        dataType: 'json',
        success: function (data) {
            window.info = data;

            parseData();
        }
    });

    function parseData() {
        let info = window.info;

        for (var index in info.kina) {
            let cinema = info.kina[index];
            let option = '<option value="' + cinema.id + '">' + cinema.name + '</option>';
            $('.cinema-selector .cinema-select').append(option);
        }

    }



    var repertuarline = `<tr class="repertuarline movie_id_%MOVIE_NUMBER%">
            <th scope="row" class="img align-middle" style="width: 25%"></th>
            <td class="title align-middle" style="width: 35%; font-size: 1.5em; min-width: 200px;"></td>
            <td class="seanse align-middle" style="width: 25%"></td>
            </tr>`;

    function szukajRepertuaru(){
        let info = window.info;
        let movies = window.movies;

        var kino_id = $('.cinema-selector .cinema-select').val();
        var wybrana_data = $('#datepicker_1').val();

        if (kino_id !== null && kino_id.length && wybrana_data.length) {
            kino_id = parseInt(kino_id);

            console.log('szukam repertuaru dla kina o id ', kino_id, ' w dniu ', wybrana_data);

            var sale_w_wybranym_kinie = getElementsByKeyAndIdFromCollection(info.sale, 'id_kina', kino_id);
            var id_sal_w_wybranym_kinie = sale_w_wybranym_kinie.map(function(item) {
                return item.id;
            });

            console.log('id_sal_w_wybranym_kinie', id_sal_w_wybranym_kinie);

            var lista_seansow = [];

            for (var index in id_sal_w_wybranym_kinie) {
                var id_sali = id_sal_w_wybranym_kinie[index];
                var seanse = getElementsByKeyAndIdFromCollection(info.seanse, 'id_sali', id_sali);

                seanse.forEach(function(item) {
                    lista_seansow.push(item);
                });
            }

            // dodatkowe filtrowanie po dacie
            lista_seansow = lista_seansow.filter(function(item) {
                return item.date.startsWith(wybrana_data)
            });

            console.log('lista_repertuarow', lista_seansow);

            // wyswietl na liscie repertuar wraz z godzinami
            //wyczysc obecny repertuar
            $('.repertuar').html('');

            lista_seansow.forEach(function (seans) {
                // pobierz info o filmie
                var film = getElementByIdFromCollection(movies, seans.id_filmu);

                var line = repertuarline.replace('%MOVIE_NUMBER%', seans.id_filmu)

                // selektor do sprawdzenia czy film jest juz na liscie
                var selector = $('.repertuar .repertuarline.movie_id_' + seans.id_filmu);

                if (selector.length === 0) {
                    $('.repertuar').append(line);

                    // uruchom ponownie ten sam selektor - powinien miec nowe elementy dodane przez append
                    var selector = $('.repertuar .repertuarline.movie_id_' + seans.id_filmu);

                    $(selector).find('.img').append(`<img src="${film.image}" class="img-fluid" />`);
                    $(selector).find('.title').html(film.title);
                }

                var godzina_seansu = seans.date.split(' ')[1];
                var seans_row = `<div class="seans seans_id_${seans.id}" data-seans-id=${seans.id}
                                              data-sala-id=${seans.id_sali}>${godzina_seansu}</div>`;

                $(selector).find('.seanse').append(seans_row);
            });
        }
    }


    $('.cinema-selector .cinema-select').on('change', szukajRepertuaru);
    $('#datepicker_1').on('changeDate', szukajRepertuaru);


    // wywolanie testowego dnia i miejsca - Katowice 2019-05-29

    $('.link-repertuar').on('click', function () {
        $('.cinema-selector .cinema-select').val("1").change();
    })
    ////////////////////


    function rysujSale(id_sali) {
        let info = window.info;

        var sale_data = getElementByIdFromCollection(info.sale, id_sali);
        var html = '<table class="sala">';

        html += '<tr><td></td>';
        for (var num in sale_data.places['A']) {
            html += '<td>' + num + '</td>';
        }
        html += '</tr>';

        for (var row_index in sale_data.places) {
            var places_in_row = sale_data.places[row_index];

            html += '<tr class="row_' + row_index + '"><td>' + row_index + '</td>';

            for (var place_index in places_in_row) {
                var is_place_available = places_in_row[place_index];

                var className;

                if (is_place_available === 1) {
                    className = 'available';
                } else {
                    className = 'unavailable';
                }

                //console.log('row', row_index, 'place', place_index);
                html += '<td class="place_' + place_index + ' '
                    + className + '" data-row='+row_index+' data-place='+place_index+'></td>';
            }

            html += '</tr>';
        }

        $('.widok_sali .sala_container').html(html);

        var kino_data = getElementByIdFromCollection(info.kina, sale_data.id_kina);

        $('.seans_info .kino').html('Kino: ' + kino_data.name);
        $('.seans_info .sala_info').html('sala nr ' + sale_data.id);
    };

    function pokazInformacjeOSeansie(id_seansu) {
        let info = window.info;
        let movies = window.movies;

        var seans_data = getElementByIdFromCollection(info.seanse, id_seansu);
        var film_data = getElementByIdFromCollection(movies, seans_data.id_filmu);

        $('.seans_info .data').html('data: ' + seans_data.date);
        $('.seans_info .film').html('film: ' + film_data.title);
    }

    function zaznaczRezerwacjeNaSaliDlaSeansu(id_seansu) {
        let info = window.info;

        var seans_data = getElementByIdFromCollection(info.seanse, id_seansu);
        var reservations = getElementsByKeyAndIdFromCollection(info.rezerwacje, 'seans_id', id_seansu);

        for (var index in reservations) {
            var reservation = reservations[index];
            var row = reservation.place[0];
            var place = reservation.place[1];

            $('.sala .row_' + row + ' .place_' + place).addClass('reserved');
        }
    }


    function runTimer() {
        clearInterval(window.timer);

        var now = new Date().getTime();
        var newDateObj = new Date();
        newDateObj.setTime(now + (10 * 60 * 1000));
        var countDownDate = newDateObj.getTime();

        window.timer = setInterval(function() {
            var now = new Date().getTime();
            var distance = countDownDate - now;

            // Time calculations for days, hours, minutes and seconds
            //var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            //var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            $('.widok_sali .timer').html(minutes + "m " + seconds + "s ");

            if (distance < 0) {
                clearInterval(window.timer);
                $('.expired_overlay').removeClass('hide');
                $('.widok_sali .timer').addClass('hide');
            }
        }, 1000);
    }



    $('.repertuar').on('click', '.seanse .seans', function () {

        if (false === window.user_data.is_logged) {
            alert('Musisz być zalogowany żeby wybrać miejsce!');
            return;
        }


        $('.widok_sali').removeClass('hide');


        var seans_id = parseInt($(this).attr('data-seans-id'));
        var sala_id = parseInt($(this).attr('data-sala-id'));

        rysujSale(sala_id);
        pokazInformacjeOSeansie(seans_id);
        zaznaczRezerwacjeNaSaliDlaSeansu(seans_id);
        runTimer();
    });



    $('.repertuar-container').on('click', '.sala_container .available:not(.reserved)', function () {

        var row = $(this).attr('data-row');
        var place = $(this).attr('data-place');
        var className = `row_${row}_place_${place}`;

        if ($(this).hasClass('choosen')) {
            $(this).removeClass('choosen');

            $(`.wybrane_miejsca .lista .${className}`).remove();
        } else {
            $(this).addClass('choosen');
            var miejsce = `<div class="miejsce ${className}">
                                    <span class="num"></span> miejsce
                                    <span class="numer">${row}${place}</span> </div>`;

            $('.wybrane_miejsca .lista').append(miejsce);
        }

        var ilosc = $('.wybrane_miejsca .lista .miejsce').length;

        $('.wybrane_miejsca .ilosc').html( ilosc );

        $('.wybrane_miejsca .lista .miejsce').each(function(i, item) {
            $(this).find('.num').html(i+1);
        });

        var cenaBiletu = 20;
        var suma = cenaBiletu * ilosc;

        $('.widok_sali .cena').html(`${ilosc} x ${cenaBiletu}zł = ${suma}zł`);
    });


    $('.repertuar-container').on('click', '.zloz-zamowienie', function () {
        var ilosc = parseInt($('.wybrane_miejsca .ilosc').html());

        if (ilosc === 0) {
            alert('Wybierz miejsca.');
            return false;
        }

        $('.widok_sali, .cinema-selector, .tabela-seansow').addClass('hide');
        $('.podsumowanie').removeClass('hide');

        clearInterval(window.timer);

        var wybrane_miejsca = '';
        $('.wybrane_miejsca .lista .miejsce .numer').each(function() {
            wybrane_miejsca += ' ' + $(this).html();
        });

        var info = {
            'kino': $('.seans_info .kino').html(),
            'sala': $('.seans_info .sala_info').html(),
            'data': $('.seans_info .data').html(),
            'film': $('.seans_info .film').html(),
            'ilosc_biletow': $('.wybrane_miejsca .ilosc').html(),
            'miejsca': wybrane_miejsca
        };

        //send email
        $.ajax({
            type: 'POST',
            url: 'http://' + app_host + '/api/send_email',
            dataType: 'json',
            data: info,
            success: function (data) {
                console.log(data);

                $('.tmp_email_url').html(`<a target="_blank" href="${data.preview_url}">Testowy link z treścią email</a>`);
            }
        });
    });

});
