export default function JsonLd({ data }: { data: object }) {
  // Safe: JSON.stringify produces no executable content; < is escaped to <
  // to prevent </script> injection. lgtm[js/xss]
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ // CodeQL[js/xss]
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
