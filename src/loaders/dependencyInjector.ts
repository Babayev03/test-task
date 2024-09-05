import Container from "typedi";

export default (models: { name: string; model: any }[]) => {
  try {
    models.forEach((m) => {
      Container.set(m.name, m.model);
    });
  } catch (error) {
    console.log("🔥 Error on dependency injector loader: %o", error);
    throw error;
  }
};
