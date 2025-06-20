(async () => {
    // Country categories and their corresponding service type (direct, partner, etc.)
    const countryCategories = {"Australia":"direct","Japan":"direct","France":"partner","United States":"direct",
        "Brazil":"codeshare","Singapore":"partner","New Zealand":"direct","Canada":"direct","Thailand":"seasonal",
        "United Kingdom":"direct","Germany":"partner","Spain":"partner","Italy":"direct","India":"partner","Mexico":"seasonal",
        "Argentina":"codeshare","South Korea":"partner","Netherlands":"partner","Portugal":"partner","Switzerland":"partner",
        "Norway":"partner","Sweden":"partner","Finland":"partner","Denmark":"partner","Ireland":"direct","Belgium":"partner",
        "Greece":"seasonal","Austria":"partner","Poland":"partner","Czech Republic":"partner","Hungary":"partner",
        "Turkey":"seasonal","Russia":"codeshare","South Africa":"direct","Egypt":"partner","Morocco":"seasonal","Kenya":"partner",
        "UAE":"direct","Qatar":"direct","Saudi Arabia":"partner","Indonesia":"direct","Malaysia":"partner","Vietnam":"seasonal",
        "Philippines":"direct","Israel":"partner","Jordan":"partner","Lebanon":"seasonal","Pakistan":"partner","Bangladesh":"codeshare",
        "Sri Lanka":"partner","Nepal":"partner","China":"direct","Taiwan":"partner","Hong Kong":"direct","Chile":"codeshare",
        "Colombia":"partner","Peru":"partner","Venezuela":"codeshare","Ecuador":"partner","Uruguay":"seasonal","Paraguay":"codeshare",
        "Bolivia":"codeshare","Panama":"partner","Costa Rica":"seasonal","Guatemala":"partner","El Salvador":"partner","Honduras":"partner",
        "Cuba":"seasonal","Jamaica":"seasonal","Dominican Republic":"seasonal","Iceland":"partner","New Caledonia":"codeshare","Fiji":"seasonal",
        "Papua New Guinea":"partner","Kazakhstan":"partner","Uzbekistan":"partner","Georgia":"partner","Armenia":"partner","Azerbaijan":"partner",
        "Ukraine":"codeshare","Belarus":"codeshare","Slovakia":"partner","Slovenia":"partner","Croatia":"seasonal","Serbia":"partner",
        "Bosnia and Herzegovina":"partner","North Macedonia":"partner","Albania":"partner","Luxembourg":"partner","Liechtenstein":"partner","Monaco":"partner",
        "Malta":"seasonal","Cyprus":"seasonal","Bahrain":"partner","Oman":"partner","Kuwait":"partner","Nigeria":"direct","Ghana":"partner","Tanzania":"partner",
        "Ethiopia":"partner","Rwanda":"partner","Uganda":"partner","Zambia":"partner","Zimbabwe":"partner","Namibia":"seasonal","Botswana":"seasonal",
        "Madagascar":"partner","Mauritius":"seasonal","Seychelles":"seasonal","Malawi":"partner","Mozambique":"partner", "United States of America": "direct"};

    // Get user's dark mode preference
    const isDark = await ClientStorageWrapper.get('darkTheme', 'cookie');

    // Define color schemes for each category based on theme
    const categoryColors = isDark ? {
        direct: "#8E1616",      // Red
        partner: "#FFD700",     // Gold
        seasonal: "#0077B5",    // Blue
        codeshare: "#f17431"    // Orange
    } : {
        direct: "#d63a3a",
        partner: "#f8d563",
        seasonal: "#66b9e7",
        codeshare: "#fa6106"
    };

    // Initialize the Leaflet map
    const map = L.map('map', {
        scrollWheelZoom: false,        // Disable scroll zoom
        zoomControl: true,
        attributionControl: false      // Hide Leaflet attribution
    }).setView([20, 0], 2);            // Default world view

    // Choose tile layer depending on theme
    const tileLayerURL = isDark
        ? 'https://stamen-tiles.a.ssl.fastly.net/toner-background/{z}/{x}/{y}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    // Add tile layer to the map
    L.tileLayer(tileLayerURL, {
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Fetch and render world GeoJSON data
    $.getJSON('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
        .done(geojson => {
            L.geoJSON(geojson, {
                style: feature => {
                    const name = feature.properties.name;
                    const category = countryCategories[name];
                    return {
                        fillColor: categoryColors[category] || "#000", // Default fallback color
                        weight: 1,
                        color: "#fff",                 // Border color
                        fillOpacity: category ? 0.85 : 0
                    };
                },
                onEachFeature: (feature, layer) => {
                    const name = feature.properties.name;
                    const category = countryCategories[name];
                    if (category) {
                        const label = category[0].toUpperCase() + category.slice(1);
                        layer.bindPopup(`<strong>${name}</strong><br>Service: ${label}`);
                    }
                }
            }).addTo(map);
        })
        .fail((_, textStatus, errorThrown) => {
            console.error("GeoJSON load error:", textStatus, errorThrown);
        });
})();