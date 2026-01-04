<script>
  export let id = "";
  export let name = "";
  export let set = "";
  export let rarity = "";
  export let showcase = false;
</script>

<div
  data-testid="card-stub"
  data-id={id}
  data-name={name}
  data-set={set}
  data-rarity={rarity}
  data-showcase={showcase ? "true" : "false"}
></div>
