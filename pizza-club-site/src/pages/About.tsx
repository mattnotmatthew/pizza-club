import React, { useEffect } from "react";

const About: React.FC = () => {
  useEffect(() => {
    document.title = "About GCPC - Greater Chicagoland Pizza Club";
  }, []);

  return (
    <div className="min-h-screen py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About GCPC
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Welcome to the Greater Chicagoland Pizza Club - where we took a
            casual activity and took it way too seriously.
          </p>
        </div>

        {/* Content sections */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* What GCPC is */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              What is GCPC?
            </h2>
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                The Greater Chicagoland Pizza Club has become a disrupter in the
                pizza club landscape. 
              </p>
              <p>
                Founded in 2013, our club began with a
                single yet powerful belief: the world doesn't need more of the
                same; it needs revolutions. Our club members are revolutionaries
                who challenge the pizza dining status quo. The taverns are the
                stages in which each member challenges the ordinary by demanding
                the extraordinary—one square slice at a time.
              </p>
              <p>For our members,
                pizza isn't just a way to meet our nourishment needs. It serves
                a greater purpose, one of the shared human experience. The
                Greater Chicagoland Pizza Club offers the opportunity to share
                in the complexities of our collective human journey. It is a
                place where we can come together, regardless of our dietary
                differences, and celebrate the cheese that binds us all
                together.
              </p>
            </div>
          </section>

          {/* Club Mission */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                Our mission is not simply to meet as a club and eat pizza; it's
                to push the boundaries of what it means to hang out and eat
                pizza with the same people over and over again.
              </p>
            </div>
          </section>

          {/* Club Operations */}
         
          {/* Ratings */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ratings
            </h2>
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                Look, we rate pizza places, but let's be real - it's not that serious. 
                We do this for fun, just to remember how things stack up against each other. 
                Everyone's taste is different, and what matters most is that we're all eating pizza in (generally) good company.
              </p>
              <p>
                Don't take the ratings to seriously. If you like a place, you like it. Point is your mileage 
                may vary, and that's perfectly fine with us.
              </p>
            </div>
          </section>

          {/* Becoming a Member */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Becoming a Member
            </h2>
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                Joining GCPC isn't as simple as just showing up (though we appreciate 
                the enthusiasm). You have to be nominated by an existing standard member 
                of the club. Think of it as a pizza-based sponsorship system.
              </p>
              <p>
                If your nomination is approved, congratulations! You become a "Friend of the Club" 
                and enter a probation period of undetermined length. During this time, 
               we'll see if you're a good fit for our particular brand of pizza enthusiasm.
              </p>
            
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
