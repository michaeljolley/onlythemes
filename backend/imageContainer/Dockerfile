FROM codercom/code-server as onlythemes

USER root

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, 
# Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work as well as node and npm.
RUN apt update && \
    apt install -yyq wget gnupg && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt update && \
    apt install -yyq google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei \
    fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    nodejs npm && \
    # Install VSCODE
    wget -O /tmp/vsc.deb https://go.microsoft.com/fwlink/?LinkID=760868 && \
    apt install -y /tmp/vsc.deb && \
    apt clean && \
    rm -rf /var/lib/apt/lists/* && \
    rm -f /tmp/vsc.deb

ENV DONT_PROMPT_WSL_INSTALL=true

USER $USER
WORKDIR /home/coder/onlythemes

COPY package*.json .
RUN npm ci

COPY . .
RUN mkdir -p ~/.config/code-server && \
    mkdir -p ~/.local/share/code-server/User && \
    mv ./config.yaml ~/.config/code-server/config.yaml && \
    mv ./settings.json ~/.local/share/code-server/User/settings.json && \
    sudo chown -R $USER:$USER /home/coder/onlythemes && \
    sudo chown -R $USER:$USER /home/coder/.config && \
    sudo chown -R $USER:$USER /home/coder/.local && \
    npm run build:production

RUN code --user-data-dir="/home/$USER/.vscode" && \
    sudo rm /usr/bin/entrypoint.sh && \
    sudo ln -s ~/onlythemes/entrypoint.sh /usr/bin/entrypoint.sh && \
    sudo ln -s ~/.vscode/extensions ~/.local/share/code-server/extensions
