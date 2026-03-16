import UIKit
import Social
import MobileCoreServices
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        handleSharedContent()
    }

    private func handleSharedContent() {
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
              let itemProvider = extensionItem.attachments?.first else {
            close()
            return
        }

        // Handle URL
        if itemProvider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
            itemProvider.loadItem(forTypeIdentifier: UTType.url.identifier) { [weak self] item, _ in
                let url = (item as? URL)?.absoluteString ?? ""
                let title = extensionItem.attributedContentText?.string ?? ""
                self?.openMainApp(title: title, url: url)
            }
            return
        }

        // Handle plain text
        if itemProvider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
            itemProvider.loadItem(forTypeIdentifier: UTType.plainText.identifier) { [weak self] item, _ in
                let text = item as? String ?? ""
                self?.openMainApp(title: text, url: nil)
            }
            return
        }

        close()
    }

    private func openMainApp(title: String, url: String?) {
        var components = URLComponents()
        components.scheme = "ntasks"
        components.host = "new-task"
        components.queryItems = [
            URLQueryItem(name: "title", value: title),
        ]
        if let url = url {
            components.queryItems?.append(URLQueryItem(name: "url", value: url))
        }

        guard let deepLink = components.url else {
            close()
            return
        }

        // Open the main app via deep link
        var responder: UIResponder? = self
        while responder != nil {
            if let application = responder as? UIApplication {
                DispatchQueue.main.async {
                    application.open(deepLink)
                }
                break
            }
            responder = responder?.next
        }

        close()
    }

    private func close() {
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }
}
