import { useMemo } from "react";
import { useParams, useLocation, useNavigate, useMatch } from 'react-router-dom';
import queryString from 'query-string';

export function useRouter() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const match = useMatch();

  // Return our custom router object
  // Memoize so that a new object is only returned if something changes
  return useMemo(() => {
    return {
      // For convenience add push(), replace(), pathname at top level
      push: navigate.push,
      replace: navigate.replace,
      pathname: location.pathname,
      // Merge params and parsed query string into single "query" object
      // so that they can be used interchangeably.
      // Example: /:topic?sort=popular -> { topic: "react", sort: "popular" }
      query: {
        ...queryString.parse(location.search), // Convert string to object
        ...params
      },
      // Include match, location, navigate objects so we have
      // access to extra React Router functionality if needed.
      match,
      location,
      navigate
    };
  }, [params, match, location, navigate]);
}
