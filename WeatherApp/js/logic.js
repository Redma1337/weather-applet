Vue.component('weather-applet', {
    props: ['lat', 'long', 'tz'],
    data: function() {
        return {
            date: new Date(),
            delay: 2,
            weather: {
                temp: 0,
                type: ''
            },
            time: {
                weekday_long: '',
                month_long: '',
                day_numeric: '',
                time_numeric: ''
            },
            location: {
                city: '',
                country: ''
            }
        }
    },
    async mounted() {
            await Promise.all([this.updateAPIData(this.lat, this.long), this.updateTimeData(this.tz), this.updateLocationData(this.tz)])
    },
    methods: {
        updateAPIData: function(lat, long) {
            axios
            .get('http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + long + '&units=metric&appid=8d7011c8db0a54de74261e1352c902e8')
            .then(response => {
                this.weather = {
                    type: response.data.weather[0].main,
                    temp: response.data.main.temp
                }
                this.location.city = response.data.name
            })
        },
        updateTimeData: function(tz) {
            var locale = 'default';
            console.log(tz)
            this.time = {
                weekday_long: this.date.toLocaleString(locale, { timeZone: tz, weekday: 'long' }),
                day_numeric: this.date.toLocaleString(locale, { timeZone: tz, day: 'numeric' }),
                month_long: this.date.toLocaleString(locale, { timeZone: tz, month: 'long' }),
                time_numeric: this.date.toLocaleString(locale, { timeZone: tz, hour: 'numeric', hour12: true, minute: 'numeric' })
            }
        },
        updateLocationData: function(tz) {
            var args = tz.split('/')
            this.location = {
                country: args[0]
            }    
        }
    },
    template: `
        <div class="weather-applet animated fadeInDown">
            <h2>{{ time.weekday_long }}</h2>
            <p class="subHead">{{ time.month_long + ", " + time.day_numeric + "th" }}</p>
            <div v-if="weather.type === 'Clouds'">
                <p class="weatherIcon"><i class="fas fa-cloud"></i> {{ weather.temp }}°</p>
            </div>
            <div v-else-if="weather.type === 'Thunderstorm'">
                <p class="weatherIcon"><i class="fas fa-bolt"></i> {{ weather.temp }}°</p>
            </div>
            <div v-else-if="weather.type === 'Rain'">
                <p class="weatherIcon"><i class="fas fa-cloud-showers-heavy"></i> {{ weather.temp }}°</p>
            </div>
            <div v-else>
                <p class="weatherIcon"><i class="far fa-sun"></i> {{ weather.temp }}°</p>
            </div>
            <p class="description"> {{ location.city + ", " + location.country }} </p>
            <p class="smallTxt">{{ time.time_numeric }}</p>
        </div> 
    `
})

var vm = new Vue({
    el: '#app',
    data: {
        dataReady: false,
        dataArr: [ //lat/lon only 2 decimals exact
            { id: 0, lat: 0, long: 0, tz: ''},
            { id: 1, lat: 40.73, long: -73.93, tz: 'America/New_York' },
            { id: 2, lat: 13.73, long: 100.52, tz: 'Asia/Bangkok' }
        ]
    },
    async mounted() {
        try {
            await this.updateOwnData(); //setup default values for own params
        } catch (error) {
            console.error('error while mounting vue-instance')
        }
    },
    methods: {
        updateOwnData: function() {
            this.dataArr[0].tz = Intl.DateTimeFormat().resolvedOptions().timeZone
            function success(position) {
                vm.dataArr[0].lat = position.coords.latitude;
                vm.dataArr[0].long = position.coords.longitude;
                vm.dataReady = true;
            }
            navigator.geolocation.getCurrentPosition(success)
        }
    }
})
