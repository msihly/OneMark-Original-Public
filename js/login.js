var activeTab,
    activeContent;

//Load DOM
window.onload = async function() {
    activeTab = document.getElementsByClassName("tab active")[0];
    activeContent = document.getElementsByClassName("tab-content active")[0];

    var tabList = document.getElementsByClassName("tab");
    for (let i = 0; i < tabList.length; i++) {tabList[i].addEventListener("click", changeTab);}
};

function changeTab() {
    activeTab.classList.remove("active");
    activeContent.classList.remove("active");
    activeTab = this;
    activeContent = document.getElementById(this.dataset.content);
    activeTab.classList.add("active");
    activeContent.classList.add("active");
}