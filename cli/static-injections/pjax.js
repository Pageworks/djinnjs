if (env.connection !== "2g" && env.connection !== "slow-2g" && !env.dataSaver) {
    const { Djinnjax } = await import(`${location.origin}/${djinnjsOutDir}/djinnjax.mjs`);
    new Djinnjax();
}
