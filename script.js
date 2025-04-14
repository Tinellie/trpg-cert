document.getElementById('generateButton').addEventListener('click', () => {
    const nameInput = document.getElementById('nameInput').value;
    const imageInput = document.getElementById('imageInput').files[0];

    if (!nameInput) {
        alert("请输入姓名！");
        return;
    }

    // 读取用户选择的图片
    let imageUrl = '';
    if (imageInput) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageUrl = e.target.result; // 获取图片的 Data URL
            modifyAndExportSVG(nameInput, imageUrl);
        };
        reader.readAsDataURL(imageInput); // 将文件读取为 Data URL
    } else {
        modifyAndExportSVG(nameInput, imageUrl); // 如果没有选择图片，直接修改 SVG
    }
});

let modifiedSVGContent = '';
function modifyAndExportSVG(name, imageUrl) {
    const certType=document.getElementById("typeSelect").value
    fetch(`cert-${certType}.svg`)
        .then(response => response.text())
        .then(svgText => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, "image/svg+xml");

            // 修改
            const tspan = svgDoc.getElementById('_持证人信息').getElementsByTagName('tspan');
            tspan[2].textContent = "  " + name; 
            tspan[9].textContent = `${certType.toUpperCase()}-${getId()}`;
            tspan[10].textContent = "";
            tspan[16].textContent = "  " + `${getDate()}`;


            const imageElement = svgDoc.getElementById('_头像');
            if (imageElement) {
                imageElement.setAttribute('xlink:href', imageUrl); // 设置为选择的图片
            }

            // 导出
            const modifiedSVG = new Blob([svgDoc.documentElement.outerHTML], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(modifiedSVG);

            // 预览
            const svgContainer = document.getElementById('certificateContainer');
            svgContainer.innerHTML = svgDoc.documentElement.outerHTML;
            svgContainer.getElementsByTagName("svg")[0].setAttribute("width", "400")


            document.getElementById('downloadButton').style.display = "block"
            document.getElementById('downloadPngButton').style.display = "block"
            modifiedSVGContent = svgDoc.documentElement.outerHTML;


        })
        .catch(error => {
            console.error('Error loading SVG:', error);
        });
}

document.getElementById('downloadButton').addEventListener('click', () => {
    if (!modifiedSVGContent) {
        alert("请先生成证件！");
        return;
    }

    // 导出新的 SVG
    const modifiedSVG = new Blob([modifiedSVGContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(modifiedSVG);

    // 创建下载链接
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'modified_certificate.svg'; // 设置下载文件名
    document.body.appendChild(downloadLink);
    downloadLink.click(); // 自动点击下载
    document.body.removeChild(downloadLink); // 下载后移除链接
    URL.revokeObjectURL(url); // 释放 URL 对象
});
document.getElementById('downloadPngButton').addEventListener('click', () => {
    if (!modifiedSVGContent) {
        alert("请先生成证件！");
        return;
    }

    // 创建一个临时的 Image 对象
    const img = new Image();

    // SVG 转换为 Data URL
    const svgBlob = new Blob([modifiedSVGContent], { type: 'image/svg+xml;charset=utf-8' });
    const DOMURL = window.URL || window.webkitURL || window;
    const url = DOMURL.createObjectURL(svgBlob);

    img.onload = function () {
        // 创建 Canvas 并设置尺寸
        const canvas = document.createElement('canvas');
        const size = 2400
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // 将 Canvas 导出为 PNG
        canvas.toBlob((blob) => {
            const pngUrl = DOMURL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = 'modified_certificate.png';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            DOMURL.revokeObjectURL(pngUrl);
        }, 'image/png');

        DOMURL.revokeObjectURL(url);
    };

    img.onerror = function () {
        alert('图像加载失败，请检查SVG内容是否正确。');
        DOMURL.revokeObjectURL(url);
    };

    img.src = url;
});

function getDate(){
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    return `${year}/${month}/${date}`;
}
function getId() {
    let id = Math.random() * 1e11
    if (id < 1e11) id += 1e11
    return id.toFixed(0)
}