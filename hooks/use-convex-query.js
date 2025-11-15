// import { useQuery, useMutation } from "convex/react";
// import { useState, useEffect } from "react";
// import { toast } from "sonner";

// export const useConvexQuery = (query, args) => {
//   const result = useQuery(query, args);
//   const [data, setData] = useState(undefined);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (result === undefined) {
//       setIsLoading(true);
//     } else {
//       try {
//         setData(result);
//         setError(null);
//       } catch (err) {
//         setError(err);
//         toast.error(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   }, [result]);

//   return {
//     data,
//     isLoading,
//     error,
//   };
// };

// export const useConvexMutation = (mutation) => {
//   const mutationFn = useMutation(mutation);
//   const [data, setData] = useState(undefined);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const mutate = async (...args) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await mutationFn(...args);
//       setData(response);
//       return response;
//     } catch (err) {
//       setError(err);
//       toast.error(err.message);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return { mutate, data, isLoading, error };
// };

import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useConvexQuery = (query, args) => {
  // Skip the query if args is undefined or "skip"
  const shouldSkip = !args || args === "skip";
  const result = useQuery(query, shouldSkip ? "skip" : args);

  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (shouldSkip) {
      setIsLoading(false);
      return;
    }

    if (result === undefined) {
      setIsLoading(true);
    } else {
      try {
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [result, shouldSkip]);

  return {
    data,
    isLoading,
    error,
  };
};

export const useConvexMutation = (mutation) => {
  const mutationFn = useMutation(mutation);
  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (...args) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await mutationFn(...args);
      setData(response);
      return response;
    } catch (err) {
      setError(err);
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, data, isLoading, error };
};