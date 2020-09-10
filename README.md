# VFace Web

See [VFace Server](https://github.com/c910335/vface-server) before this.

![screenshot](screenshot.png)

## Installation

1. Clone this repository.

```sh
git clone https://github.com/c910335/vface-web.git
cd vface-web
```

2. Install the dependencies.

```sh
yarn
```

3. Download `Cubism SDK for Web` from the [official site](https://www.live2d.com/download/cubism-sdk/download-web/) and copy `Core` and `Framework` into the directory.

```sh
# Downloaded into ~/Download
cp -r ~/Download/CubismSdkForWeb-4-r.1/Framework .
cp -r ~/Download/CubismSdkForWeb-4-r.1/Core .
```

4. Download a model from the [official site](https://www.live2d.com/download/sample-data/) or build your own model and copy it into the directory.

```sh
# Downloaded into ~/Download
cp -r ~/Download/model_name .
```

5. Edit the configuration file.

```sh
vim config.js
```

## Run Development Server

```sh
yarn start
```

## Run Production Server

```sh
yarn build; and yarn serve
```

## Contributing

1. Fork it ( https://github.com/c910335/vface-web/fork )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request

## Contributors

- [c910335](https://github.com/c910335) Tatsiujin Chin - creator, maintainer
