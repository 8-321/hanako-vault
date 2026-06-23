<script lang="ts">
  import { apiBaseUrl } from "./lib/config";
  import { homeView } from "./routes/home";
</script>

<main>
  <h1>{homeView.title}</h1>
  <p>{homeView.description}</p>
  <p>Backend API base URL: <code>{apiBaseUrl}</code></p>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    background: linear-gradient(180deg, #f4f7fb, #eef2f8);
    color: #1a202c;
  }

  main {
    max-width: 760px;
    margin: 6rem auto;
    padding: 0 1rem;
  }

  h1 {
    margin-bottom: 0.5rem;
  }

  code {
    background: #e6edf8;
    border-radius: 0.25rem;
    padding: 0.125rem 0.35rem;
  }
</style>
