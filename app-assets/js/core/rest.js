let host = 'http://localhost:8080';

function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function redirect(url, newTab = false) {
    var ua = navigator.userAgent.toLowerCase(),
        isIE = ua.indexOf('msie') !== -1,
        version = parseInt(ua.substr(4, 2), 10);
    // Internet Explorer 8 and lower
    if (isIE && version < 9) {
        var link = document.createElement('a');
        if (newTab) {
            link.target = '_blank';
        }
        link.href = url;
        document.body.appendChild(link);
        link.click();
    }
    // All other browsers can use the standard window.location.href (they don't lose HTTP_REFERER like Internet Explorer 8 & lower41 does)
    else {
        if (newTab) {
            window.open(
                url,
                '_blank'
            );
        } else {
            window.location.href = url;
        }
    }
}

function createRequest(path, type) {
    let http = new XMLHttpRequest();
    let url = host + path;

    http.open(type, url, true);
    return http;
}

function showErrorMessage(message) {
    alert('Wystąpił problem z działaniem aplikacji: ' + message);
}


function getMovies() {
    let http = createRequest("/movie", "GET");
    http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
            let obj = JSON.parse(http.responseText);

            document.getElementById("main").removeAttribute('hidden');
            document.getElementById("loader").setAttribute('hidden', true);

            createMoviesCards(obj);

        } else if (http.readyState === 4 && http.status != 200) {
            showErrorMessage(http.responseText);
        }
    };

    http.send();
}

function createMoviesCards(movies) {
    partitionArray(movies, 5)
        .forEach(createMovieCardDeck)

}

function createMovieCardDeck(movies) {
    cardDeckDiv = document.createElement("div");
    cardDeckDiv.classList.add("card-deck");
    cardDeckDiv.style.marginTop = "1%";

    movies.forEach(movie => {
        movieCard = createMovieCard(movie);
        cardDeckDiv.appendChild(movieCard);
    });

    document.getElementById("main").appendChild(cardDeckDiv);
}

function createMovieCard(movie) {
    cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.classList.add("col-md-2");

    img = document.createElement("img");
    img.classList.add("card-img-top");
    img.src = movie.imgUrl;
    img.style.width = '200px';
    img.style.height = '350px';
    img.style.margin = "0 auto";
    img.style.marginTop = "2%";
    cardDiv.appendChild(img);

    cardBodyDiv = document.createElement("div");
    cardBodyDiv.classList.add("card-body");
    cardDiv.appendChild(cardBodyDiv);

    cardTitleLink = document.createElement("a");
    cardTitleLink.href = "/movie.html?alias=" + movie.alias;
    cardBodyDiv.appendChild(cardTitleLink);

    cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.innerHTML = movie.title;
    cardTitleLink.appendChild(cardTitle);

    descriptionP = document.createElement("p");
    descriptionP.classList.add("card-text");
    descriptionP.innerHTML = movie.description;
    cardBodyDiv.appendChild(descriptionP);

    cardFooter = document.createElement("div");
    cardFooter.classList.add("card-footer");
    cardDiv.appendChild(cardFooter);

    descriptionP2 = createMovieSmallDescriptionElement('Release date: ' + movie.releaseDate);
    cardFooter.appendChild(descriptionP2);

    descriptionP2 = createMovieSmallDescriptionElement('Duration: ' + movie.duration + ' minutes');
    cardFooter.appendChild(descriptionP2);

    return cardDiv;
}

function createMovieSmallDescriptionElement(text) {
    descriptionP2 = document.createElement("p");
    descriptionP2.classList.add("card-text");
    small = document.createElement("small");
    small.classList.add("text-muted");
    small.innerHTML = text;
    descriptionP2.appendChild(small);
    return descriptionP2;
}

function partitionArray(input, spacing) {
    var output = [];
    for (var i = 0; i < input.length; i += spacing)
        output[output.length] = input.slice(i, i + spacing);

    return output;
}

function getMovieByAlias() {
    let http = createRequest("/movie?alias=" + getUrlParam('alias'), "GET");
    http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
            let obj = JSON.parse(http.responseText);

            document.getElementById("main").removeAttribute('hidden');
            document.getElementById("loader").setAttribute('hidden', true);

            createMovieView(obj);
        } else if (http.readyState === 4 && http.status != 200) {
            showErrorMessage(http.responseText);
        }
    };

    http.send();
}

function createMovieView(movie) {
    movieImg = document.getElementById("movieImg");
    movieImg.src = movie.imgUrl;
    movieImg.style.width = '200px';
    movieImg.style.height = '350px';
    movieImg.style.margin = "0 auto";
    movieImg.style.marginTop = "2%";

    document.getElementById("title").innerHTML = movie.title;
    document.getElementById("movieTitle").innerHTML = movie.title;
    document.getElementById("movieDescription").innerHTML = movie.description;
    document.getElementById("movieDuration").innerHTML = movie.duration + " minutes";
    document.getElementById("movieReleaseDate").innerHTML = movie.releaseDate;
    document.getElementById("movieCategory").innerHTML = movie.category;

    createScreeningsView(movie.screenings);
}

function createScreeningsView(screenings) {
    container = document.getElementById("screenings-container");

    screeningsByDate = Object.groupBy(screenings, ({ date }) => date);

    Object.keys(screeningsByDate)
        .forEach(function (date) {
            result = createScreeningsByDateDiv(date, screeningsByDate[date]);
            container.appendChild(result);
        });
}

function createScreeningsByDateDiv(date, screeningsArr) {
    main = document.createElement("div");
    dateElement = document.createElement("h5");
    dateElement.innerHTML = date;
    main.appendChild(dateElement);

    // <a href="#" class="badge badge-primary">Primary</a>

    screeningsArr.sort((a, b) => a.time.localeCompare(b.time))
        .forEach(screening => {
            screeningBadge = document.createElement("a");
            screeningBadge.classList.add("badge");
            screeningBadge.classList.add("badge-primary");
            screeningBadge.style.margin = "5px";
            screeningBadge.style.fontSize = "2rem";
            screeningBadge.innerHTML = screening.time;
            screeningBadge.href = "/screening.html?id=" + screening.id;
            main.appendChild(screeningBadge);
        });

    return main;
}

function getScreening() {
    let http = createRequest("/screening/" + getUrlParam('id'), "GET");
    http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
            let obj = JSON.parse(http.responseText);

            document.getElementById("main").removeAttribute('hidden');
            document.getElementById("loader").setAttribute('hidden', true);

            createScreeningView(obj);
        } else if (http.readyState === 4 && http.status != 200) {
            showErrorMessage(http.responseText);
        }
    };

    http.send();
}

function createScreeningView(screening) {
    movieImg = document.getElementById("movieImg");
    movieImg.src = screening.movie.imgUrl;
    movieImg.style.width = '120px';
    movieImg.style.height = '180px';
    movieImg.style.margin = "0 auto";
    movieImg.style.marginTop = "2%";

    document.getElementById("movieTitle").innerHTML = screening.movie.title;
    document.getElementById("screeningRoomNumber").innerHTML = 'Room ' + screening.roomNumber;
    document.getElementById("screeningDate").innerHTML = 'Date: ' + screening.date + ' ' + screening.time;
    document.getElementById("ticketPrice").innerHTML = 'Ticket price: ' + screening.ticketPrice + ' PLN';

    seatsContainer = document.getElementById("seats-container");
    for (var i = 0; i < screening.seats.length; i++) {
        rowContainer = document.createElement("div");
        rowContainer.style = 'margin:0 auto; display: flex; justify-content: space-between; width:100%;';
        seatsContainer.appendChild(rowContainer);

        row = document.createElement("span");
        row.style = 'flex-basis: 100%;'
        row.innerHTML = i + 1;
        rowContainer.appendChild(row);

        var seats = screening.seats[i];
        for (var j = 0; j < seats.length; j++) {
            var seat = seats[j];
            seatElement = document.createElement(seat.state == 'AVAILABLE' ? "a" : "span");
            seatElement.classList.add('badge');
            seatElement.classList.add(seat.state == 'AVAILABLE' ? 'badge-success' : 'badge-danger');
            seatElement.style = 'flex-basis: 100%; margin:5px'
            seatElement.innerHTML = seat.seat;
            if (seat.state == 'AVAILABLE') {
                seatElement.href = "#reservation-confirmation-modal";
                seatElement.setAttribute('data-toggle', 'modal');
                seatElement.setAttribute('data-row', seat.row);
                seatElement.setAttribute('data-seat', seat.seat);
                seatElement.addEventListener("click", test);
            }
            rowContainer.appendChild(seatElement);
        }

        row = document.createElement("span");
        row.innerHTML = i + 1;
        row.style = 'flex-basis: 100%;'
        rowContainer.appendChild(row);
    }

}

function test(e) {
    var a = $(e.currentTarget); 
    var row = a.attr('data-row');
    var seat = a.attr('data-seat');

    document.getElementById("reservation-row").value = row;
    document.getElementById("reservation-seat").value = seat;

    text = "Are you sure want to reserve seat numer " + seat + " in row " + row + " for the movie "
        + document.getElementById("movieTitle").innerHTML
        + " on " + document.getElementById("screeningDate").innerHTML + "?";

    document.getElementById('reservation-confirmation-question').innerHTML = text;

}

function confirmReservation() {
    params = "row=" + document.getElementById("reservation-row").value
        + "&seat=" + document.getElementById("reservation-seat").value;

    let http = createRequest("/screening/" + getUrlParam('id') + "/reservation?" + params, "POST");
    http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
            let tikcetId = http.responseText;

            redirect("/ticket.html?id=" + tikcetId);
        } else if (http.readyState === 4 && http.status != 200) {
            showErrorMessage(http.responseText);
        }
    };

    http.send();
}

function getTicketInformation(){
    let http = createRequest("/ticket/" + getUrlParam('id'), "GET");
    http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
            let obj = JSON.parse(http.responseText);

            document.getElementById("main").removeAttribute('hidden');
            document.getElementById("loader").setAttribute('hidden', true);

            createTicketView(obj);
        } else if (http.readyState === 4 && http.status != 200) {
            showErrorMessage(http.responseText);
        }
    };

    http.send();
}

function createTicketView(ticket){
    movieImg = document.getElementById("movieImg");
    movieImg.src = ticket.movie.imgUrl;
    movieImg.style.width = '200px';
    movieImg.style.height = '350px';

    document.getElementById("movieTitle").innerHTML = ticket.movie.title;
    document.getElementById("screeningRoomNumber").innerHTML = 'Room: ' + ticket.screening.roomNumber;
    document.getElementById("screeningSeatAndRow").innerHTML = 'Row: ' + ticket.screeningSeat.row + ' Seat: ' + ticket.screeningSeat.seat;
    document.getElementById("screeningDate").innerHTML = 'Screaning date: ' + ticket.screening.date;
    document.getElementById("ticketStatus").innerHTML = 'Ticket status: ' + ticket.ticketState;
    document.getElementById("ticketStatus").style.color = ticket.ticketState=='UNPAID' ? 'red' : 'green';
    document.getElementById("ticketReservationDate").innerHTML = 'Ticket reservation date: ' + ticket.reservationDate;
    document.getElementById("ticketPrice").innerHTML = 'Ticket price: ' + ticket.screening.ticketPrice;

}
