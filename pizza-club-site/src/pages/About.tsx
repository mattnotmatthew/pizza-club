import React, { useEffect } from "react";
import { Link } from "react-router-dom";

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
            casual activity and racheted it up to 11.
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
                together
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
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              How We Operate
            </h2>
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                GCPC operates as a collaborative community where every member
                contributes to our collective knowledge. Our activities include:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Group Visits
                  </h3>
                  <p>
                    We organize regular visits to pizzerias throughout
                    Chicagoland, trying new places and revisiting favorites.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Reviews & Ratings
                  </h3>
                  <p>
                    Members share detailed reviews and ratings to help build our
                    comprehensive{" "}
                    <Link
                      to="/restaurants"
                      className="text-red-600 hover:text-red-800"
                    >
                      restaurant database
                    </Link>
                    .
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Community Events
                  </h3>
                  <p>
                    Beyond pizza visits, we host social events, pizza-making
                    workshops, and special celebrations.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Documentation
                  </h3>
                  <p>
                    We maintain detailed records of our visits, create
                    infographics, and share our discoveries with the broader
                    community.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Meeting Details */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Meeting Details
            </h2>
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                GCPC meets regularly for pizza adventures throughout the Chicago
                area. Our{" "}
                <Link to="/events" className="text-red-600 hover:text-red-800">
                  monthly events
                </Link>{" "}
                typically include:
              </p>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Typical Meeting Format
                </h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Timing:</strong> Usually weekends, with occasional
                    weekday events
                  </li>
                  <li>
                    <strong>Duration:</strong> 2-3 hours including dining and
                    discussion
                  </li>
                  <li>
                    <strong>Location:</strong> Rotating among pizzerias across
                    Chicagoland
                  </li>
                  <li>
                    <strong>Group Size:</strong> Typically 8-15 members per
                    event
                  </li>
                  <li>
                    <strong>Activities:</strong> Pizza tasting, group
                    discussion, rating/review session
                  </li>
                </ul>
              </div>
              <p>
                Check our{" "}
                <Link to="/events" className="text-red-600 hover:text-red-800">
                  events page
                </Link>{" "}
                for upcoming meetings and RSVP information. All skill levels and
                pizza preferences are welcome!
              </p>
            </div>
          </section>

          {/* Membership Information */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Membership
            </h2>
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                Joining GCPC is simple and open to anyone who shares our passion
                for great pizza. Here's what you need to know:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Who Can Join
                  </h3>
                  <ul className="space-y-2">
                    <li>Pizza enthusiasts of all experience levels</li>
                    <li>Residents of Chicagoland and surrounding areas</li>
                    <li>Visitors and newcomers to the region</li>
                    <li>Anyone interested in local food culture</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Member Benefits
                  </h3>
                  <ul className="space-y-2">
                    <li>Access to exclusive group events</li>
                    <li>Priority RSVP for popular restaurants</li>
                    <li>Member directory and networking</li>
                    <li>Special discounts at partner establishments</li>
                  </ul>
                </div>
              </div>

              <p>
                Ready to join our pizza-loving community? Browse our{" "}
                <Link to="/members" className="text-red-600 hover:text-red-800">
                  member profiles
                </Link>{" "}
                to see who you'll be dining with, and reach out to any current
                member to learn more about getting involved.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-red-900 mb-3">
                  Getting Started
                </h3>
                <p className="text-red-800">
                  The best way to join is to attend one of our upcoming events
                  as a guest. Check our{" "}
                  <Link
                    to="/events"
                    className="text-red-600 hover:text-red-800"
                  >
                    events calendar
                  </Link>{" "}
                  and RSVP for your first pizza adventure with GCPC!
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
