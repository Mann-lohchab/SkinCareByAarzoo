import React from "react";

export function CTASection() {
  return (
    <section
      className="section"
      id="contact"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div
          style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}
        >
          <h2 className="text-heading-lg" style={{ marginBottom: "1rem" }}>
            Ready for Real Results?
          </h2>
          <p
            className="text-body-lg"
            style={{ color: "#666", marginBottom: "2rem" }}
          >
            Stop relying on harsh temporary solutions. Invest in understanding
            your skin at a deeper level.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
              marginTop: "3rem",
            }}
            className="cta-grid"
          >
            {/* Card 1 */}
            <div className="brutalist-card" style={{ padding: "2rem" }}>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                Start Your Journey
              </h3>
              <p
                style={{
                  color: "#666",
                  lineHeight: 1.6,
                  marginBottom: "1.5rem",
                  fontSize: "0.875rem",
                }}
              >
                Book a consultation to understand your skin at a deeper level
                and get a personalized treatment plan.
              </p>
              <a
                href="#"
                style={{
                  display: "inline-block",
                  background: "var(--color-primary-blue)",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  fontWeight: 700,
                  borderRadius: "4px",
                  textDecoration: "none",
                  border: "3px solid var(--color-border)",
                  boxShadow: "4px 4px 0px black",
                }}
              >
                Book Consultation
              </a>
            </div>

            {/* Card 2 */}
            <div className="brutalist-card" style={{ padding: "2rem" }}>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                Our Methodology
              </h3>
              <p
                style={{
                  color: "#666",
                  lineHeight: 1.6,
                  marginBottom: "1.5rem",
                  fontSize: "0.875rem",
                }}
              >
                Learn about our clinical approach to skin health and why we
                focus on root causes, not just symptoms.
              </p>
              <a
                href="#approach"
                style={{
                  display: "inline-block",
                  background: "white",
                  color: "var(--color-text)",
                  padding: "0.75rem 1.5rem",
                  fontWeight: 700,
                  borderRadius: "4px",
                  textDecoration: "none",
                  border: "3px solid var(--color-border)",
                  boxShadow: "4px 4px 0px black",
                }}
              >
                Learn More
              </a>
            </div>
          </div>

          <p
            style={{
              marginTop: "3rem",
              padding: "1.5rem",
              backgroundColor: "var(--color-light-background)",
              border: "3px solid var(--color-border)",
              fontSize: "0.875rem",
              color: "#666",
            }}
          >
            <strong>Note:</strong> We work with individuals ready to move beyond
            trial-and-error skincare, stop relying on harsh temporary solutions,
            and invest in long-term skin integrity.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .cta-grid {
            grid-template-columns: 1fr !important;
          }
          .brutalist-card {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </section>
  );
}
