package gr.studiom.app22450;

import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.net.Uri;

import java.util.Locale;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.ValueCallback;

import androidx.activity.OnBackPressedCallback;
import androidx.annotation.Nullable;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

import android.util.Base64;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.stream.Collectors;

public class MainActivity extends BridgeActivity {

  private static final String TAG = "App22450";
  private static String sMapAddonScript;
  private static String sMapboxAddonScript;

  @Override
  public void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    if (sMapAddonScript == null) {
      try {
        InputStream is = getAssets().open("public/22450-map-addon-inject.js");
        sMapAddonScript = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))
            .lines().collect(Collectors.joining("\n"));
      } catch (Exception e) {
        Log.w(TAG, "Leaflet addon not found", e);
      }
    }
    if (sMapboxAddonScript == null) {
      try {
        InputStream is = getAssets().open("public/22450-mapbox-addon-inject.js");
        sMapboxAddonScript = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))
            .lines().collect(Collectors.joining("\n"));
      } catch (Exception e) {
        Log.w(TAG, "Mapbox addon not found", e);
      }
    }

    WebView webView = getBridge().getWebView();

    webView.setWebViewClient(new BridgeWebViewClient(getBridge()) {

      @Override
      public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        if ((sMapAddonScript != null || sMapboxAddonScript != null) && request != null && request.isForMainFrame()
            && "GET".equalsIgnoreCase(request.getMethod())) {
          Uri uri = request.getUrl();
          String url = uri != null ? uri.toString() : "";
          String host = uri != null && uri.getHost() != null ? uri.getHost() : "";
          if (host.equals("22450.gr") || host.equals("www.22450.gr") || host.endsWith(".22450.gr")) {
            try {
              String html = fetchUrl(url, view);
              if (html != null && !html.isEmpty()) {
                String injected = injectMapAddon(html);
                if (injected != null) {
                  return new WebResourceResponse("text/html", "UTF-8",
                      new ByteArrayInputStream(injected.getBytes(StandardCharsets.UTF_8)));
                }
              }
            } catch (Exception e) {
              Log.w(TAG, "Map addon injection failed", e);
            }
          }
        }
        return super.shouldInterceptRequest(view, request);
      }

      private String fetchUrl(String urlString, WebView webView) {
        HttpURLConnection conn = null;
        try {
          URL url = new URL(urlString);
          conn = (HttpURLConnection) url.openConnection();
          conn.setRequestMethod("GET");
          String ua = "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36";
          if (webView != null && webView.getSettings() != null) {
            String wvUa = webView.getSettings().getUserAgentString();
            if (wvUa != null && !wvUa.isEmpty()) ua = wvUa;
          }
          conn.setRequestProperty("User-Agent", ua);
          conn.setConnectTimeout(10000);
          conn.setReadTimeout(10000);
          conn.setInstanceFollowRedirects(true);
          int code = conn.getResponseCode();
          if (code >= 200 && code < 300) {
            InputStream is = conn.getInputStream();
            return new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))
                .lines().collect(Collectors.joining("\n"));
          }
        } catch (Exception e) {
          Log.w(TAG, "Fetch failed: " + urlString, e);
        } finally {
          if (conn != null) conn.disconnect();
        }
        return null;
      }

      private String injectMapAddon(String html) {
        if (html == null) return null;
        StringBuilder scripts = new StringBuilder();
        if (sMapAddonScript != null) {
          String safe = sMapAddonScript.replace("</script>", "<\\/script>");
          scripts.append("<script>").append(safe).append("</script>");
        }
        if (sMapboxAddonScript != null) {
          String safe = sMapboxAddonScript.replace("</script>", "<\\/script>");
          scripts.append("<script>").append(safe).append("</script>");
        }
        if (scripts.length() == 0) return html;
        String script = scripts.toString();
        int head = html.toLowerCase(Locale.ROOT).indexOf("<head");
        if (head >= 0) {
          int end = html.indexOf(">", head) + 1;
          if (end > 0) {
            return html.substring(0, end) + script + html.substring(end);
          }
        }
        int body = html.toLowerCase(Locale.ROOT).indexOf("<body");
        if (body >= 0) {
          int end = html.indexOf(">", body) + 1;
          if (end > 0) {
            return html.substring(0, end) + script + html.substring(end);
          }
        }
        return html;
      }

      @Override
      public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        if (url != null && url.contains("22450.gr")) {
          injectAddons(view, 0);
          view.postDelayed(() -> injectAddons(view, 1), 500);
          view.postDelayed(() -> injectAddons(view, 2), 1500);
          view.postDelayed(() -> injectAddons(view, 3), 3500);
        }
      }

      private void injectAddons(WebView view, int attempt) {
        try {
          if (sMapboxAddonScript != null) {
            String b64 = Base64.encodeToString(sMapboxAddonScript.getBytes(StandardCharsets.UTF_8), Base64.NO_WRAP);
            view.evaluateJavascript("(function(){try{var s=document.createElement('script');s.textContent=atob('" + b64 + "');(document.head||document.documentElement).appendChild(s);}catch(e){}})();", null);
          }
          if (sMapAddonScript != null) {
            String b64 = Base64.encodeToString(sMapAddonScript.getBytes(StandardCharsets.UTF_8), Base64.NO_WRAP);
            view.evaluateJavascript("(function(){try{var s=document.createElement('script');s.textContent=atob('" + b64 + "');(document.head||document.documentElement).appendChild(s);}catch(e){}})();", null);
          }
        } catch (Exception e) {
          Log.w(TAG, "Inject attempt " + attempt + " failed", e);
        }
      }

      @Override
      public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri uri = request.getUrl();
        String url = uri.toString();
        String host = uri.getHost() != null ? uri.getHost() : "";

        // ✅ ΜΕΣΑ στο app μόνο το 22450.gr
        boolean isInternal =
          host.equals("22450.gr") ||
          host.equals("www.22450.gr") ||
          host.endsWith(".22450.gr");

        if (isInternal) {
          return false; // άστο να φορτώσει μέσα στο WebView
        }

        // ✅ Αυτά να ανοίγουν σε εφαρμογές
        if (url.startsWith("mailto:") ||
            url.startsWith("tel:") ||
            url.startsWith("sms:") ||
            url.startsWith("whatsapp:") ||
            url.startsWith("viber:")) {
          openExternal(url);
          return true;
        }

        // ✅ Facebook / Instagram / WhatsApp / Gmail / Yahoo έξω
        if (host.contains("facebook.com") ||
            host.contains("instagram.com") ||
            host.contains("wa.me") ||
            host.contains("api.whatsapp.com") ||
            host.contains("mail.google.com") ||
            host.contains("gmail.com") ||
            host.contains("mail.yahoo.com") ||
            host.contains("yahoo.com")) {
          openExternal(url);
          return true;
        }

        // ✅ Όλα τα άλλα έξω (safe)
        openExternal(url);
        return true;
      }

      @Override
      public boolean shouldOverrideUrlLoading(WebView view, String url) {
        Uri uri = Uri.parse(url);
        String host = uri.getHost() != null ? uri.getHost() : "";

        boolean isInternal =
          host.equals("22450.gr") ||
          host.equals("www.22450.gr") ||
          host.endsWith(".22450.gr");

        if (isInternal) return false;

        openExternal(url);
        return true;
      }

      private void openExternal(String url) {
        try {
          Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
          intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
          startActivity(intent);
        } catch (Exception ignored) {
        }
      }
    });

    // Αρχική σελίδα: back = scroll πάνω πρώτα, μετά έξοδος. Άλλες σελίδες: κανονικό back
    getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
      @Override
      public void handleOnBackPressed() {
        WebView wv = getBridge().getWebView();
        if (wv == null) {
          finish();
          return;
        }
        String url = wv.getUrl() != null ? wv.getUrl() : "";
        if (is22450HomePage(url)) {
          // Αν έχεις κάνει scroll κάτω → πήγαινε πάνω. Αν είσαι πάνω → dialog έξοδος
          // Διάβασε και τη γλώσσα από το site (localStorage, html lang, path)
          String js = "(function(){var y=window.scrollY||document.documentElement.scrollTop;" +
              "if(y>50){window.scrollTo(0,0);return JSON.stringify({scroll:'scrolled'});}" +
              "var lang='el';" +
              "try{var L=document.documentElement.lang||localStorage.getItem('lang')||localStorage.getItem('language')||localStorage.getItem('locale')||'';L=(L||'').toLowerCase().substr(0,2);if(L==='en'||L==='it')lang=L;}catch(e){}" +
              "var p=(location.pathname||'').toLowerCase();if(p.indexOf('/en')===0)lang='en';if(p.indexOf('/it')===0)lang='it';" +
              "return JSON.stringify({scroll:'top',lang:lang});})()";
          wv.evaluateJavascript(js, (ValueCallback<String>) result -> {
            if (result == null) return;
            String lang = "el";
            if (result.contains("\"lang\"")) {
              int i = result.indexOf("\"lang\"");
              int q = result.indexOf(":", i) + 1;
              int e = result.indexOf("\"", q + 1);
              if (q > 0 && e > q) lang = result.substring(q + 1, e).toLowerCase();
            }
            if (result.contains("top")) {
              showExitConfirmDialog(lang);
            }
          });
          return;
        }
        if (wv.canGoBack()) {
          wv.goBack();
        } else {
          finish();
        }
      }
    });
  }

  private void showExitConfirmDialog(String siteLang) {
    runOnUiThread(() -> {
      String msg = getStringForLocale(siteLang, R.string.exit_confirm_message);
      String no = getStringForLocale(siteLang, R.string.exit_confirm_no);
      String yes = getStringForLocale(siteLang, R.string.exit_confirm_yes);
      new AlertDialog.Builder(this)
          .setMessage(msg)
          .setNegativeButton(no, null)
          .setPositiveButton(yes, (d, w) -> finish())
          .show();
    });
  }

  private String getStringForLocale(String lang, int resId) {
    try {
      Locale locale = "en".equals(lang) ? Locale.ENGLISH : "it".equals(lang) ? Locale.ITALIAN : new Locale("el");
      Configuration config = new Configuration(getResources().getConfiguration());
      config.setLocale(locale);
      Context ctx = createConfigurationContext(config);
      return ctx.getResources().getString(resId);
    } catch (Exception e) {
      return getString(resId);
    }
  }

  /** Αρχική σελίδα = 22450.gr ή www.22450.gr με path / ή κενό */
  private boolean is22450HomePage(String url) {
    if (url == null || url.isEmpty()) return false;
    try {
      Uri uri = Uri.parse(url);
      String host = uri.getHost() != null ? uri.getHost().toLowerCase() : "";
      if (!host.equals("22450.gr") && !host.equals("www.22450.gr") && !host.endsWith(".22450.gr")) {
        return false;
      }
      String path = uri.getPath();
      return path == null || path.isEmpty() || path.equals("/");
    } catch (Exception e) {
      return false;
    }
  }
}
