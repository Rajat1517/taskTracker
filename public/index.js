
const open= document.getElementById("open");
const close= document.getElementById("close");
const popup= document.getElementById("modal-container");
open.addEventListener("click",function()
{
    popup.classList.add("show");
});

close.addEventListener("click",function()
{
    popup.classList.remove("show");
});
console.log(open.innerHTML);
console.log(close.innerHTML);