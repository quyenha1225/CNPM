function About() {
  return (
    <div className="container mt-5 pt-5">
      <div className="py-5 text-center">
        <h1>About ElectroShop</h1>
        <p className="lead text-muted">
          This is the About page for the store. You can add information about your
          brand, mission, or features here.
        </p>
      </div>
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <p>
            ElectroShop is built with React and Bootstrap. Navigate using the menu
            to view products or come back to the homepage.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
