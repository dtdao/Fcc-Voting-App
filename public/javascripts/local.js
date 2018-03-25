$(document).ready(function(){
	//add more available spaces to input options
	$("#moreOption").click(function(){
		$(".pollOptions").append(
			"<br><input class='form-control option' name='options'>"
		);
	});

	/// used post data instead to send data
	$("#modalLogin").click(function(event){
		// $.post($("#loginForm").attr("action"), $("#loginForm").serialize(), function(data, status){
		// 	if(data){
		// 		console.log(data);
		// 		saveToken(data.token);
		// 		window.location.replace("/");
		// 	};
		// }).fail(function(data,status){
		// 	alert(data.responseJSON.message);
		// });
		$.ajax({
			url: "/login",
			type: "POST",
			dataType: "json",
			data: $("#loginForm").serialize()			
		}).done(function(data, status){
			alert("It was succesfull login");
			saveToken(data.token);
			window.location.replace("/");
		}).fail(function(data){
			$(".modalerror").html("<p class='text-danger text-left'>"+data.responseJSON.message+"</p>")

		})
	});

//Handles submitting new polls on click.  
//Uses .Ajax to set the the header with token for authentication.
	$("#submit").click(function(){
		$.ajax({
			url: "/api/new",
			type: "POST",
			ContentType: "application/json; charset=utf-8",
			dataType: "json",
			data: $("#pollForm").serialize(),
			beforeSend: function(xhr){
				xhr.setRequestHeader("Authorization", "Bearer " + getToken());
			}
		}).done(function(){
			alert("You succesfully created a poll!");
			window.location.replace("/");
			//done statement not working!!
		}).fail(function(data){
			alert(data.responseJSON.message);
		})
	});

	$("#registerUser").click(function(){
		$.ajax({
			url: "/api/register",
			type: "POST",
			dataType: "json",
			data: $("#registerForm").serialize()
		}).done(function(data){
			alert("You succesfully registered!");
			window.location.replace("/");
		}).fail(function(data){
			$(".modalerror").html("<p class='text-danger text-left'>"+data.responseJSON.message+"</p>")
		})
	});


//
	$(".logctrl").on("click", function(event){
		if(isLoggedIn() && event){
			localStorage.removeItem("vote-token");
			window.location.replace("/");
		}
	});

	$(".optionAdd").click(function(){
		var pollid = $(this).attr("value");
		$.ajax({
			url: "/api/poll/" + pollid,
			type: "PUT",
			data: $("#addOptionForm").serialize(),
			beforeSend: function(xhr){
				xhr.setRequestHeader("Authorization", "Bearer " + getToken());
			}
		}).done(function(data){
			alert(data.responseJSON.message);
		}).fail(function(data){
			alert(data.responseJSON.message)
		})

	})

	$(".addOpenModal").click(function(){
		var pollid = $(this).attr("id");
		console.log(pollid);
	})

	$(document).on("click", ".addModalOpen", function(){
		var pollid = $(this).attr("id");
		$(".optionAdd").val(pollid)
	})

	$(".pollDelete").click(function(){
		var pollid = $(this).attr("id");
		$.ajax({
			url: "/api/poll/"+pollid,
			type: "DELETE",
			beforeSend: function(xhr){
				xhr.setRequestHeader("Authorization", "Bearer " + getToken());
			}
		}).done(function(data){
			alert(data.responseJSON.message);
		}).fail(function(data){
			alert(data.responseJSON.message)
		})
	});

	// var ctx = document.getElementById("myChart");
	// var myChart = new Chart(ctx, {
	//     type: 'pie',
	//     data: {
	//         labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
	//         datasets: [{
	//             label: '# of Votes',
	//             data: [12, 19, 3, 5, 2, 3],
	//             backgroundColor: [
	//                 'rgba(255, 99, 132, 0.2)',
	//                 'rgba(54, 162, 235, 0.2)',
	//                 'rgba(255, 206, 86, 0.2)',
	//                 'rgba(75, 192, 192, 0.2)',
	//                 'rgba(153, 102, 255, 0.2)',
	//                 'rgba(255, 159, 64, 0.2)'
	//             ],
	//             borderColor: [
	//                 'rgba(255,99,132,1)',
	//                 'rgba(54, 162, 235, 1)',
	//                 'rgba(255, 206, 86, 1)',
	//                 'rgba(75, 192, 192, 1)',
	//                 'rgba(153, 102, 255, 1)',
	//                 'rgba(255, 159, 64, 1)'
	//             ],
	//             borderWidth: 1
	//         }]
	//     },
	//     options: {
	//         scales: {
	//             yAxes: [{
	//                 ticks: {
	//                     beginAtZero:true
	//                 }
	//             }]
	//         }
	//     }
	// });
});


//Onload code that changes the login and logout out appearance of the navigation bar
$(window).on("load", function(){
	if(isLoggedIn()){
		var userInfo = currentUser();
		//change the href, so when you log out you just go to main page
		$(".logctrl").attr("href", "/");
		//addin the user name profile icon.
		$(".navbar-right").prepend(
			"<li class='nav-item'><a class='nav-link nav-name' href='/user/" + userInfo._id + "'>"+ 
			"<span><i class='fas fa-user'></i></span>  Hello, "+ userInfo.name + "</a></li>"
			);
		//add sign-out icon
		$(".logctrl").removeAttr("data-toggle");
		$(".logctrl").html("<span><i class='fas fa-sign-out-alt'></i> Logout");
		$(".register").hide();
	}

})

var saveToken = function(token){
	localStorage.setItem("vote-token", token);
}
var getToken = function(){
	return localStorage.getItem("vote-token");
}
var logout = function(){
	localStorage.removeItem("vote-token")
}
var isLoggedIn = function(){
	var  token = getToken();
	if(token){
		var payload = JSON.parse(window.atob((getToken().split(".")[1])));
		return payload.exp > Date.now() / 1000;
	}
	else {
		return false;
	}
}
var currentUser = function(){
	if(isLoggedIn()){
		var token = getToken();
		var payload = JSON.parse(window.atob((getToken().split(".")[1])));
		return payload;
	}
}