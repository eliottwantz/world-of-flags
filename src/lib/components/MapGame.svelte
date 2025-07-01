<script lang="ts">
	import { MapLibre, GeoJSONSource, FillLayer } from 'svelte-maplibre-gl';
	import maplibregl from 'maplibre-gl';

	let map: maplibregl.Map | undefined = $state();

	function onclick(event: maplibregl.MapMouseEvent) {
		if (!map) {
			console.warn('Map is not initialized yet.');
			return;
		}

		if (event.type === 'click') {
			const target = event.target;
			console.log(target);

			const features = map.queryRenderedFeatures(event.point, {
				layers: ['country-polygons']
			});
			if (features.length > 0) {
				const countryProps = features[0].properties;
				console.log(countryProps);
				alert(
					`Clicked country: ${countryProps.ADMIN || countryProps.name || countryProps.NAME} with iso3: ${countryProps.iso_a3}`
				); // iso_a3 maps to country cca3 code
			}
		}
	}
</script>

<div class="mx-auto flex h-full w-full max-w-full items-center justify-center p-4">
	<MapLibre bind:map class="h-full w-full" style="/map-style.json" {onclick}>
		<GeoJSONSource id="countries" data="/countries.geojson">
			<FillLayer
				id="country-polygons"
				paint={{
					'fill-color': '#000000',
					'fill-opacity': 0 // fully transparent
				}}
			/>
		</GeoJSONSource>
	</MapLibre>
</div>
