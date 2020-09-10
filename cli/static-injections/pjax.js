if (env.connection !== "2g" && env.connection !== "slow-2g" && !env.dataSaver) {
    await import(`${location.origin}/${djinnjsOutDir}/djinnjax.mjs`);
}
