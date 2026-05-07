var firstNameInput = document.getElementById('cf-fname');
var lastNameInput = document.getElementById('cf-lname');
var emailInput = document.getElementById('cf-email');
var subjectInput = document.getElementById('cf-subject');
var messageInput = document.getElementById('cf-msg');
var submitBtn = document.getElementById('btn-submit');
var cancelBtn = document.getElementById('btn-cancel');
var loading = document.getElementById('loading');
var fNameAlert  = document.getElementById('fname-alert');
var lNameAlert  = document.getElementById('lname-alert');
var emailAlert  = document.getElementById('email-alert');
var subjectAlert  = document.getElementById('sub-alert');
var messageAlert  = document.getElementById('mess-alert');
var modeToggle = document.getElementById('mode');
var searchInput = document.getElementById('cityInput');
var heroLocation = document.getElementById('heroLocation'); 
var heroDate = document.getElementById('heroDate');
var heroTemp = document.getElementById('heroTemp');
var heroConditiontxt = document.getElementById('heroCondition');
var heroFeels = document.getElementById('heroFeels');
var metaHumidity = document.getElementById('metaHumidity');
var metaWind = document.getElementById('metaWind');
var metaVis = document.getElementById('metaVis');
var metaPressure = document.getElementById('metaPressure');
var heroIconBig = document.getElementById('heroIconBig');
var sunRise = document.getElementById('sideRise');
var sunSet = document.getElementById('sideSet');
var cloudCoverHTML = document.getElementById('sideCloud');
var UV = document.getElementById('sideUV');
var highLowTemp = document.getElementById('sideHL');
var precipation = document.getElementById('sidePrecip');
var strip = document.getElementById('hourlyStrip');
var btnC=document.getElementById('btnC');
var btnF=document.getElementById('btnF');
var chart = document.getElementById('barChart');
var bgNight=document.getElementById('bg-night');
var bgSunny=document.getElementById('bg-sunny');
var bgAfternoon=document.getElementById('bg-afternoon');
var bgRain=document.getElementById('bg-rain');
var bgWinter=document.getElementById('bg-winter');
var toast = document.getElementById('toast');
var toastMsg = document.getElementById('toast-msg');
var toastIcon = toast.querySelector('i');

firstNameRegex=/^[A-Za-z0-9 ]+$/;
lastNameRegex=/^[A-Za-z0-9 ]+$/;
emailRegex=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
subjectRegex=/^(?!\s*$).{3,500}$/;
messageRegex=/^[A-Za-z0-9 ]+$/;

let searchTimeout;
searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    let val = searchInput.value.trim();
    if (val.length >= 3) {
        searchTimeout = setTimeout(() => {
            fetchingFN(val);
        }, 800); 
}});

var modeTheme = localStorage.getItem('theme');

if (modeTheme === 'light') {
    document.body.classList.add('light-mode');
    if(modeToggle) modeToggle.innerHTML = `<i class="fa-regular fa-moon"></i>`;
} else {
    document.body.classList.remove('light-mode');
    if(modeToggle) modeToggle.innerHTML = `<i class="fa-solid fa-moon"></i>`;
}

var messageList = [];
if (localStorage.getItem("messages")) {
    messageList = JSON.parse(localStorage.getItem("messages"));
}
//--------------------------- API FETCHING --------------------------------------
var dataListRaw=[];
var dataList=[];
var resForcastData=[];
var locationInfoData={};
var currentData={};
var weatherConditionData="";
var temp = 0;
var feelsLike = 0;
var windSpeed = 0;
var humidity = 0;
var visibility= 0;
var pressure = 0;
var uvIndex = 0;
var precip = 0;
var cloudCover = 0;
var allDateData = [];
var allAstroData = [];
var allHourlyData = [];
var todayDate = "";
var localTime ="";
var todayDateFormatted;
var unit = 'C';
let cityName ;
var nameOfCity ;
let country;
var todayDateRaw;
var dateOptions;
function tempDisp(c) {
    if (unit === 'C')
        return Math.round(c) + '°C';
    return Math.round(c * 1.8 + 32) + '°F';
}

function setUnit(u) {
    unit = u;
    btnC.classList.toggle('active', u === 'C');
    btnF.classList.toggle('active', u === 'F');
    display(); 
    
    if (allHourlyData.length > 0) {
        todayDateRaw = new Date(localTime); 
        renderHourly(allHourlyData[0], todayDateRaw);
    }if (dataList.forecast) {
        renderBar(dataList.forecast.forecastday);
    }
}

async function fetchingFN(city='alexandria'){
    loading.classList.toggle("d-none");
    try {
        dataListRaw = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=34765809efb34b00af1213114260205&q=${city}&days=14&aqi=yes`);
        dataList = await dataListRaw.json();
        if (dataList.error) {
            showToast("City not found! Please check the name.", true);
            return; 
        }
        localTime = dataList.location.localtime;
        cityName = dataList.location.name;
        country = dataList.location.country;
        nameOfCity=cityName +' , '+ country;
        currentData = dataList.current;
        weatherConditionData =  dataList.current.condition;
        weatherIconCodeData =  dataList.current.condition.code;
        weatherDescriptionData =  dataList.current.condition.text;
        temp = dataList.current.temp_c;            
        feelsLike = dataList.current.feelslike_c;    
        windSpeed = dataList.current.wind_kph;     
        humidity = dataList.current.humidity;      
        visibility = dataList.current.vis_km;      
        pressure = dataList.current.pressure_mb;    
        uvIndex = dataList.current.uv;             
        precip = dataList.current.precip_mm;        
        cloudCover = dataList.current.cloud;        
        allAstroData=[];
        allDateData=[];
        allHourlyData=[];
        for (let i = 0; i < dataList.forecast.forecastday.length; i++) {
         allDateData.push(dataList.forecast.forecastday[i].date) ;
         allAstroData.push(dataList.forecast.forecastday[i].astro);
         allHourlyData.push(dataList.forecast.forecastday[i].hour); 
    }
    todayDateRaw = new Date(localTime); 
    dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    todayDateFormatted = todayDateRaw.toLocaleDateString('en-US', dateOptions);
    renderHourly(allHourlyData[0], todayDateRaw); 
    renderBar(dataList.forecast.forecastday);
    renderStats();
    console.log("Data fetched successfully!");
    display();
     setBackground(weatherIconCodeData, currentData.is_day,todayDateRaw.getHours());
    } catch (error) {
        showToast("Something went wrong. Check your connection!", true);
        }
        finally {
        loading.classList.add("d-none"); 
        console.log("Fetching process finished.");
    }
}

fetchingFN();

//----------------------------- END OF API FETCHING ------------------------------------

function cancelation(){
  Swal.fire({
                title: "Are you sure?",
                text: "You want to delete!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
        }).then((result) => {
          firstNameInput.value = "";
          lNameAlert.value = "";
          emailInput.value = "";
          subjectInput.value = "";
          subjectInput.value = "";
          fNameAlert.classList.add('d-none');       
          lNameAlert.classList.add('d-none');       
          emailAlert.classList.add('d-none');       
          subjectAlert.classList.add('d-none');        
          messageAlert.classList.add('d-none');
          clearForm();
            Swal.fire({
                 title: "deleted Successfully!",
                 icon: "success",
                 confirmButtonColor: "#6f42c1"
            });
        });
}

function clearForm() {
  firstNameInput.value = "";
  lastNameInput.value = "";
  emailInput.value = "";
  subjectInput.value = "";
  subjectInput.value = "";
}

function submitMessage(){
    if (validate(firstNameInput, firstNameRegex, fNameAlert) && 
         validate(lastNameInput, lastNameRegex, lNameAlert) && 
         validate(emailInput, emailRegex, emailAlert) && 
         validate(subjectInput, subjectRegex, subjectAlert) && 
         validate(messageInput, messageRegex, messageAlert)) {
            Swal.fire({
                title: "Are you sure?",
                text: "You want to send!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, send it!"
        }).then((result) => {
              if (result.isConfirmed) {
                var message={
                fName : firstNameInput.value,
                lName : lastNameInput.value,
                email : emailInput.value,
                subj : subjectInput.value,
                mess : messageInput.value,
            };
            messageList.push(message);
            firstNameInput.classList.add('is-valid');
            lastNameInput.classList.add('is-valid');
            emailInput.classList.add('is-valid');
            subjectInput.classList.add('is-valid');
            messageInput.classList.add('is-valid');
            firstNameInput.classList.remove('is-invalid');
            lastNameInput.classList.remove('is-invalid');
            emailInput.classList.remove('is-invalid');
            subjectInput.classList.remove('is-invalid');
            messageInput.classList.remove('is-invalid');
            localStorage.setItem("messages", JSON.stringify(messageList));
            clearForm();
            Swal.fire({
                title: "sent Successfully!",
                icon: "success",
                confirmButtonColor: "#6f42c1",
            });
        }});
    };
}

function checkAlert(){
    if(firstNameInput.value == ""|| lNameAlert.value == ""||
    emailInput.value == ""|| subjectInput.value == ""||subjectInput.value == ""){
        fNameAlert.classList.add('d-none');
        lNameAlert.classList.add('d-none');
        emailAlert.classList.add('d-none');
        subjectAlert.classList.add('d-none');
        messageAlert.classList.add('d-none');
}
}

function validate(element, regex, alertDiv) {
    if (regex.test(element.value)) {
        element.classList.add('is-valid');
        element.classList.remove('is-invalid');
        alertDiv.classList.add('d-none');
        checkAlert();
        return true;
    } else {
        element.classList.add('is-invalid');
        element.classList.remove('is-valid');
        alertDiv.classList.remove('d-none');
        checkAlert();
        return false;
    }
}

function mode() {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
        modeToggle.innerHTML = `<i class="fa-regular fa-moon"></i>`;
        localStorage.setItem('theme', 'light');
    } else {
        modeToggle.innerHTML = `<i class="fa-solid fa-moon"></i>`;
        localStorage.setItem('theme', 'dark');
    }
}

function display(){
    heroLocation.innerHTML = nameOfCity;
    heroDate.innerHTML = todayDateFormatted; 
    metaPressure.innerHTML = `${pressure} mb`;
    heroTemp.innerHTML = tempDisp(temp).replace('°C', '°C');
    heroFeels.innerHTML= `Feels Like ${feelsLike}°`;
    metaHumidity.innerHTML=`${humidity} %`;
    metaWind.innerHTML=`${Math.round(windSpeed)}  km/h`;
    metaVis.innerHTML=`${visibility} km`;
    heroIconBig.innerHTML = `<i class="fa-solid ${getIcon(weatherIconCodeData, currentData.is_day)}"></i>`;
    heroConditiontxt.innerHTML= weatherDescriptionData;
    UV.innerHTML= `UV Index ${uvIndex}`;
    var todayForecast = dataList.forecast.forecastday[0].day;
    highLowTemp.innerHTML = `${tempDisp(todayForecast.maxtemp_c)} / ${tempDisp(todayForecast.mintemp_c)}`;
    precipation.innerHTML = currentData.precip_mm + ' mm';
    cloudCoverHTML.innerHTML= `Cloud cover ${cloudCover} %`;
    sunRise.innerHTML = allAstroData[0].sunrise;
    sunSet.innerHTML = '↓ ' + allAstroData[0].sunset;    
    console.log("Display updated with:", nameOfCity, temp);
}

 function getIcon(code, isDay) {
       if (code === 1000) return isDay ? 'fa-sun' : 'fa-moon';
       if ([1003].includes(code)) return isDay ? 'fa-cloud-sun' : 'fa-cloud-moon';
       if ([1006, 1009].includes(code)) return 'fa-cloud';
       if ([1063, 1150, 1153, 1180, 1183].includes(code)) return 'fa-cloud-drizzle';
       if ([1186, 1189, 1192, 1195, 1198, 1201].includes(code)) return 'fa-cloud-rain';
       if ([1087, 1273, 1276].includes(code)) return 'fa-cloud-bolt';
       if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) return 'fa-snowflake';
       if ([1030, 1135, 1147].includes(code)) return 'fa-smog';
       return 'fa-cloud';
}

function renderHourly(hours, nowObj) {
    if (!strip) return;
    strip.innerHTML = '';
    
    const currentHour = nowObj.getHours();

    hours.forEach(h => {
        const hDate = new Date(h.time);
        const hHour = hDate.getHours();
        const isNow = hHour === currentHour;
        const timeStr = hDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const card = document.createElement('div');
        card.className = 'hour-card' + (isNow ? ' now' : '');
        card.innerHTML = `
            <div class="hour-time">${isNow ? 'NOW' : timeStr}</div>
            <div class="hour-icon"><i class="fa-solid ${getIcon(h.condition.code, h.is_day)}"></i></div>
            <div class="hour-temp">${tempDisp(h.temp_c)}</div>
            <div class="hour-rain">
                <i class="fa-solid fa-droplet" style="font-size:9px"></i> ${h.chance_of_rain}%
            </div>
        `;
        strip.appendChild(card);
    });
}

searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    var val = searchInput.value.trim();
    if (val.length >= 1) {
        searchTimeout = setTimeout(function() {
            fetchingFN(val);
        }, 50);
    }else if (val.length == 0) {
        fetchingFN('Alexandria'); 
    }
});

function applyBgImage(imgPath) {
  var bgs = [bgNight, bgSunny, bgAfternoon, bgRain, bgWinter];
  var active = document.getElementById('bg-night');
  bgs.forEach(bg => bg.classList.remove('active'));
  active.style.backgroundImage = `url(${imgPath})`;
  active.classList.add('active');
}

function setBackground(code, isDay, localHour) {

  var isRain = [
    1063,1150,1153,1180,1183,1186,1189,
    1192,1195,1198,1201,1087,1273,1276,
    1240,1243,1246
  ].includes(code);

  var isSnow = [
    1066,1114,1117,1210,1213,
    1216,1219,1222,1225,1255,1258
  ].includes(code);

  var localNow = new Date();
  var deviceHour = localNow.getHours();

  // ليل
  var isNightTime = !isDay || (deviceHour >= 20 || deviceHour < 6);

  // عصر
  var isAfternoon = isDay && (localHour >= 15 && localHour < 20);


  // اختار الخلفية
  if (isRain) {

    applyBgImage("img/Rain_night.JPG");

  } else if (isSnow) {

    applyBgImage("img/winter_night.JPG");

  } else if (isNightTime) {

    applyBgImage("img/night.JPG");

  } else if (isAfternoon) {

    applyBgImage("img/afternoon_sunnyDay.png");

  } else {

    applyBgImage("img/SunnyDay.png");

  }
}

function renderBar(forecastDays) {
  if (!chart) return;
  chart.innerHTML = '';
  var maxTemp = Math.max(...forecastDays.map(d => d.day.maxtemp_c));
  var minTemp = Math.min(...forecastDays.map(d => d.day.mintemp_c));
  var range = (maxTemp - minTemp) || 1;
  var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  forecastDays.forEach((d, i) => {
    var date = new Date(d.date);
    var dayName = days[date.getDay()];
    var isToday = i === 0;
    var heightPct = ((d.day.maxtemp_c - minTemp) / range) * 60 + 25;

    var col = document.createElement('div');
    col.className = 'bar-col';
    
    col.innerHTML = `
      <div class="bar-temp-top">${tempDisp(d.day.maxtemp_c)}</div>
      <div class="bar-wrap">
        <div class="bar-fill ${isToday ? 'today' : ''}" style="height:${heightPct}%"></div>
      </div>
      <div class="bar-icon">
        <i class="fa-solid ${getIcon(d.day.condition.code, 1)}"></i>
      </div>
      <div class="bar-day" style="${isToday ? 'color:var(--accent); font-weight:700' : ''}">
        ${isToday ? 'Today' : dayName}
      </div>
    `;
    chart.appendChild(col);
  });
}

function renderStats() {
    if (!currentData || !dataList.forecast) return;

    const today = dataList.forecast.forecastday[0];
        const aqi = currentData.air_quality ? (currentData.air_quality['us-epa-index'] || 1) : 1;
    const aqiLabels = ['Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];
    
    if (document.getElementById('statAqi')) {
        document.getElementById('statAqi').textContent = aqi;
        document.getElementById('statAqiBar').style.width = Math.min((aqi / 6) * 100, 100) + '%';
        document.getElementById('statAqiLabel').textContent = aqiLabels[aqi - 1] || '—';
    }

    const uv = today.day.uv;
    const uvLabel = uv <= 2 ? 'Low' : uv <= 5 ? 'Moderate' : uv <= 7 ? 'High' : uv <= 10 ? 'Very High' : 'Extreme';
    
    if (document.getElementById('statUV')) {
        document.getElementById('statUV').textContent = uv;
        document.getElementById('statUVBar').style.width = Math.min((uv / 11) * 100, 100) + '%';
        document.getElementById('statUVLabel').textContent = uvLabel;
    }

    const pm = currentData.air_quality ? Math.round(currentData.air_quality.pm2_5 || 0) : 0;
    if (document.getElementById('statPMBar')) {
        document.getElementById('statPM').textContent = pm;
        document.getElementById('statPMBar').style.width = Math.min((pm / 150) * 100, 100) + '%';
    }

    if (document.getElementById('statMoon')) {
        const moon = today.astro;
        document.getElementById('statMoon').textContent = moon.moon_illumination + '%';
        document.getElementById('statMoonLabel').textContent = moon.moon_phase;
        document.getElementById('statMoonBar').style.width = moon.moon_illumination + '%';
    }
}

function showToast(message, isError = true) {
    toastMsg.innerText = message;

    if (isError) {
        toast.style.borderLeft = "5px solid #ff4d4d"; 
        toastIcon.className = "fa-solid fa-circle-exclamation text-danger"; 
    } else {
        toast.style.borderLeft = "5px solid #2ecc71";
        toastIcon.className = "fa-solid fa-circle-check text-success";
    }

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

var menuToggle = document.getElementById("menuToggle");
var closeSidebar = document.getElementById("closeSidebar");
var sidebar = document.querySelector(".sidebar");

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.add("open"); 
        menuToggle.style.display = "none";
    });
}

if (closeSidebar && sidebar) {
    closeSidebar.addEventListener("click", () => {
        sidebar.classList.remove("open");
        menuToggle.style.display = "flex"; 
    });
}