<script>
	
	import { activeCard } from "./lib/stores/activeCard.js";
	
	let thisGrid;
	
	$: active = thisGrid && thisGrid.contains( $activeCard );
	
</script>

<section 
	class="card-grid" 
	class:active
	bind:this={thisGrid}
>

<slot />

</section>

<style>
	.card-grid {
		display: grid;
		grid-template-columns: 1fr;
		grid-gap: 50px 2vw;
		transform-style: preserve-3d;
		height: 100%;
		max-width: 1200px;
		margin: auto;
		padding: 50px;
		position: relative;
	}
	
	.card-grid.active {
		z-index: 99;
		/* isolation: isolate; */
	}
		
	@media screen and (min-width: 900px) {
		.card-grid {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}
	
	
	@media screen and (max-width: 900px) {
		/* Mobile UX: show cards in a simple vertical list (no overlap/fan). */
		.card-grid {
			grid-template-columns: 1fr;
			grid-gap: 34px;
			padding: clamp(22px, 6vw, 50px) clamp(16px, 5vw, 34px);
		}

		:global( .card-grid > .card ) {
			position: relative;
			left: 0 !important;
			top: 0 !important;
			grid-column: auto;
			grid-row: auto;
			transform: none !important;
			opacity: 1 !important;
			transition: none;
		}
	}

	@media screen and (min-width: 600px) and (max-width: 900px) {
		/* Slightly wider but still a vertical list. */
		.card-grid {
			max-width: 520px;
			margin: auto;
		}
	}

	:global( .card-grid > .card.active ) {
		transform: translate3d(0, 0, 0.1px)!important;
	}
	
</style>
