export function usePathname() {
  return "/";
}

export function useRouter() {
  return {
    back() {},
    forward() {},
    prefetch() {},
    push() {},
    refresh() {},
    replace() {},
  };
}

export function useSearchParams() {
  return new URLSearchParams();
}

export function redirect() {
  throw new Error("redirect");
}

export function notFound() {
  throw new Error("notFound");
}
