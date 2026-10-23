import UIKit
import WebKit

/// WKWebView ↔ JavaScript（js/ios-native.js）
final class NativeBridge: NSObject, WKScriptMessageHandler {
    weak var presenter: UIViewController?

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == "cnctoolkit",
              let body = message.body as? [String: Any],
              let action = body["action"] as? String
        else { return }

        switch action {
        case "shareFile":
            guard let filename = body["filename"] as? String,
                  let base64 = body["base64"] as? String,
                  let data = Data(base64Encoded: base64)
            else { return }
            share(items: [writeTemp(data: data, filename: filename)])

        case "saveText":
            guard let filename = body["filename"] as? String,
                  let text = body["text"] as? String
            else { return }
            let url = writeTemp(data: Data(text.utf8), filename: filename)
            share(items: [url])

        default:
            break
        }
    }

    private func writeTemp(data: Data, filename: String) -> URL {
        let safe = filename.replacingOccurrences(of: "/", with: "_")
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(safe)
        try? data.write(to: url, options: .atomic)
        return url
    }

    private func share(items: [Any]) {
        DispatchQueue.main.async { [weak self] in
            guard let vc = self?.presenter else { return }
            let activity = UIActivityViewController(activityItems: items, applicationActivities: nil)
            if let pop = activity.popoverPresentationController {
                pop.sourceView = vc.view
                pop.sourceRect = CGRect(x: vc.view.bounds.midX, y: vc.view.bounds.midY, width: 1, height: 1)
            }
            vc.present(activity, animated: true)
        }
    }
}
