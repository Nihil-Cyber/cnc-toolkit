import SwiftUI
import WebKit
import UIKit

/// 與 CSS `--bg` 一致（底部 Home 條區）；頂欄由網頁 `--bg-panel` 覆蓋
private extension UIColor {
    static let cncToolkitChrome = UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor(red: 13 / 255, green: 17 / 255, blue: 23 / 255, alpha: 1)
            : UIColor(red: 238 / 255, green: 241 / 255, blue: 246 / 255, alpha: 1)
    }
}

struct ToolkitWebView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> ToolkitWebViewController {
        ToolkitWebViewController()
    }

    func updateUIViewController(_ uiViewController: ToolkitWebViewController, context: Context) {}
}

final class ToolkitWebViewController: UIViewController, WKNavigationDelegate {
    private var webView: WKWebView?
    private let bridge = NativeBridge()
    private var didLoadToolkit = false

    deinit {
        tearDownWebView()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .cncToolkitChrome
        bridge.presenter = self
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        guard !didLoadToolkit else { return }
        didLoadToolkit = true
        setUpWebViewIfNeeded()
        loadBundledToolkit()
    }

    private func setUpWebViewIfNeeded() {
        guard webView == nil else { return }

        let config = WKWebViewConfiguration()
        let uc = WKUserContentController()
        uc.add(bridge, name: "cnctoolkit")
        config.userContentController = uc
        if #available(iOS 14.0, *) {
            let prefs = WKWebpagePreferences()
            prefs.allowsContentJavaScript = true
            config.defaultWebpagePreferences = prefs
        } else {
            config.preferences.javaScriptEnabled = true
        }

        let wv = WKWebView(frame: .zero, configuration: config)
        wv.navigationDelegate = self
        wv.isOpaque = true
        wv.backgroundColor = .cncToolkitChrome
        let scroll = wv.scrollView
        scroll.contentInsetAdjustmentBehavior = .never
        scroll.minimumZoomScale = 1.0
        scroll.maximumZoomScale = 1.0
        scroll.bouncesZoom = false
        scroll.pinchGestureRecognizer?.isEnabled = false
        wv.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(wv)

        NSLayoutConstraint.activate([
            wv.topAnchor.constraint(equalTo: view.topAnchor),
            wv.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            wv.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            wv.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])

        webView = wv
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        pushSafeAreaInsetsToPage()
    }

    /// file:// WKWebView 內 env(safe-area-inset-*) 常為 0，用原生 inset 推 CSS 變數
    private func pushSafeAreaInsetsToPage() {
        guard let wv = webView else { return }
        let i = view.safeAreaInsets
        let js = """
        (function(){
          var r = document.documentElement;
          r.style.setProperty('--native-safe-top','\(i.top)px');
          r.style.setProperty('--native-safe-right','\(i.right)px');
          r.style.setProperty('--native-safe-bottom','\(i.bottom)px');
          r.style.setProperty('--native-safe-left','\(i.left)px');
        })();
        """
        wv.evaluateJavaScript(js, completionHandler: nil)
    }

    private func tearDownWebView() {
        webView?.navigationDelegate = nil
        webView?.configuration.userContentController.removeScriptMessageHandler(forName: "cnctoolkit")
        webView?.stopLoading()
        webView?.removeFromSuperview()
        webView = nil
    }

    private func loadBundledToolkit() {
        guard let wv = webView else { return }
        guard let folder = Bundle.main.url(forResource: "WebAssets", withExtension: nil) else {
            showMissingAssetsAlert()
            return
        }
        let index = folder.appendingPathComponent("index.html")
        guard FileManager.default.fileExists(atPath: index.path) else {
            showMissingAssetsAlert()
            return
        }
        wv.loadFileURL(index, allowingReadAccessTo: folder)
    }

    private func showMissingAssetsAlert() {
        let alert = UIAlertController(
            title: "WebAssets 缺失",
            message: "請在 repo 根目錄執行：./scripts/sync-ios-assets.sh，然後重新 Build。",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "好", style: .default))
        present(alert, animated: true)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        pushSafeAreaInsetsToPage()
    }
}
