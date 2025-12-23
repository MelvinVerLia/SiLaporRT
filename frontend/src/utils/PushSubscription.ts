export async function subscribeUserToPush(userId: string) {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;

  const convertedKey = urlBase64ToUint8Array(
    import.meta.env.VITE_VAPID_PUBLIC_KEY!
  );

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedKey,
  });

  console.log("subscription", subscription);

  if (import.meta.env.VITE_API_BASE_URL_PROD) {
    await fetch(
      `${import.meta.env.VITE_API_BASE_URL_PROD}/notification/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subscription, userId }),
      }
    );
  } else {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/notification/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ subscription, userId }),
    });
  }
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";

  const permission = await Notification.requestPermission();
  return permission; 
}

export async function enableNotifications(userId: string) {
  const permission = await requestNotificationPermission();

  if (permission !== "granted") {
    console.warn("User said no. Move on with your life.");
    return;
  }

  await subscribeUserToPush(userId);
}


function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
