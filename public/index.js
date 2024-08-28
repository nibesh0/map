document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    navigator.geolocation.getCurrentPosition(success, error);

    let marker, circle;
    let points = [];
    let markers = [];
    let lines = [];
    let lenghts=[]
    const distanceDisplay = document.getElementById('distance');
    const clearButton = document.getElementById('clear');

    function success(pos) {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;

        if (marker) {
            map.removeLayer(marker);
        }
        if (circle) {
            map.removeLayer(circle);
        }

        marker = L.marker([lat, lng]).addTo(map);
        circle = L.circle([lat, lng], { radius: acc }).addTo(map);
        map.fitBounds(circle.getBounds());
    }

    function error(err) {
        if (err.code === 1) {
            alert("Please allow geolocation access.");
        } else {
            alert("Unable to retrieve your location.");
        }
    }

    map.on('click', function (e) {
        const latLng = e.latlng;
        points.push(latLng);
        const marker = L.marker(latLng).addTo(map);
        markers.push(marker);

        if (points.length > 1) {
            const startPoint = points[points.length - 2];
            const endPoint = points[points.length - 1];

            const polyline = L.polyline([startPoint, endPoint], { color: 'blue' }).addTo(map);
            lines.push(polyline);

            const distance = startPoint.distanceTo(endPoint) / 1000;
            const midPoint = [
                (startPoint.lat + endPoint.lat) / 2,
                (startPoint.lng + endPoint.lng) / 2
            ];

            let len =  L.marker(midPoint, {
                icon: L.divIcon({
                    className: 'distance-label',
                    html: `${distance.toFixed(2)} km`,
                    iconSize: [100, 40],
                    iconAnchor: [50, 20]
                })
            });
            len.addTo(map);
            lenghts.push(len);
        }

        console.log(markers);
        if (points.length > 1) {
            calculateTotalDistance();
        }
    });

    function calculateTotalDistance() {
        if (points.length < 2) return;

        const pointCoords = points.map(p => ({ lat: p.lat, lng: p.lng }));

        fetch('/distance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ points: pointCoords }),
        })
            .then(response => response.json())
            .then(data => {
                if (distanceDisplay) {
                    distanceDisplay.innerText = `Total Distance: ${data.distance.toFixed(2)} ${data.units}`;
                }
            })
            .catch(error => console.error('Error:', error));
    }
    clearButton.addEventListener('click', () => {
        points = [];
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        lines.forEach(line => map.removeLayer(line));
        lines = [];
        lenghts.forEach(len=>map.removeLayer(len));
        lenghts=[];
        distanceDisplay.innerText = '';
    });

    fetch('/geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: function (feature) {
                    return { color: 'blue' };
                }
            }).addTo(map);
        })
        .catch(error => console.error('Error loading GeoJSON:', error));

});
