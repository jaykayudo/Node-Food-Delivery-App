var sidebar = document.getElementById("sidebar")
var closeButton = document.getElementById("closeButton")
var openButton = document.getElementById("openButton")

openButton.onclick=function(){
    sidebar.classList.add("active")
}
closeButton.onclick =function(){
    sidebar.classList.remove("active")

}
function removeFromCart(e,data){
    
}
function addToCart(e,data){
    e.preventDefault()
    $.ajax({
        url:'/add-to-cart',
        type:'get',
        data:{
            item: data
        },
        success: function(response){
            // e.target.parentNode.innerHTML = "<i class='fa fa-times'></i>";
            document.getElementById(data).innerHTML = "<i class='fa fa-check'></i>"
        }
    });
    console.log(data)
}

function addSticky(){
    var headNav = document.getElementById("headnav")
    headNav.classList.toggle("sticky",window.scrollY > 10)  
}

window.addEventListener("scroll",addSticky)