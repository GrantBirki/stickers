<script>
  export let title = "";
  export let subtitle = "";
  export let body = "";
</script>

<section class="page">
  <h1>{title}</h1>
  {#if subtitle}
    <p class="page__sub">{subtitle}</p>
  {/if}
  {#if body}
    <div class="page__body">{body}</div>
  {/if}
</section>

<style>
  .page {
    padding-top: 20px;
  }

  .page__sub {
    margin: 0 0 18px;
    opacity: 0.85;
  }

  .page__body {
    max-width: 72ch;
    line-height: 1.65;
    color: var(--muted);
  }
</style>

