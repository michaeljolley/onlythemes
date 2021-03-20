FROM codercom/code-server as onlythemes

WORKDIR /home/coder/onlythemes

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, 
# Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work as well as node and npm.
RUN sudo apt update && \
    sudo apt install -yyq wget gnupg && \
    sudo wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add - && \
    sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    sudo apt update && \
    sudo apt install -yyq google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei \
    fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    nodejs npm && \
    sudo rm -rf /var/lib/apt/lists/* && \
    sudo apt clean

COPY package*.json .
RUN npm install

COPY . .
RUN sudo mkdir -p ~/.config/code-server && \
    sudo mkdir -p ~/.local/share/code-server/User && \
    sudo mv ./config.yaml ~/.config/code-server/config.yaml && \
    sudo mv ./settings.json ~/.local/share/code-server/User/settings.json && \
    sudo chown -R $USER:$USER /home/coder/.config && \
    sudo chown -R $USER:$USER /home/coder/.local

RUN sudo rm /usr/bin/entrypoint.sh && \
    sudo ln -s ~/onlythemes/entrypoint.sh /usr/bin/entrypoint.sh
