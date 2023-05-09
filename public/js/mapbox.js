const locations = JSON.parse(document.getElementById("map").dataset.locations);

console.log(locations, typeof locations);

mapboxgl.accessToken =
  "pk.eyJ1IjoiaWFtZ3VmcmFuIiwiYSI6ImNsaGFncjE0cjBoZHEzZnMyNjUydWpreWsifQ.yoRSLYOBLa1pSzHWlypHfQ";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/iamgufran/clhahi9wl011g01pggeq5fovb",
  // center: [-118.113491, 34.111745],
  // zoom: 5,
  // interactive: false,
  scrollZoom: false
});

// Area that'll be displayed on the map
const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Create marker
  const el = document.createElement("div");
  el.className = "marker";

  // Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: "bottom",
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extend map bounds to include the current location
  bounds.extend(loc.coordinates);

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
});
